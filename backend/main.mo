import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import List "mo:core/List";

import Nat "mo:core/Nat";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── User Profile ──────────────────────────────────────────

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Role Management ───────────────────────────────────────

  /// Returns the role of the calling principal.
  public query ({ caller }) func getUserRole() : async AccessControl.UserRole {
    if (caller.isAnonymous()) {
      return #guest;
    };
    AccessControl.getUserRole(accessControlState, caller);
  };

  /// Assign a role to a principal. Admin-only (guard is inside assignRole).
  public shared ({ caller }) func setUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // AccessControl.assignRole already enforces admin-only internally,
    // but we add an explicit guard for clarity and defence-in-depth.
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  /// List all principals and their roles. Admin-only.
  public query ({ caller }) func listUsers() : async [(Principal, AccessControl.UserRole)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    // Collect every principal that has an explicit role stored.
    // We iterate over userProfiles as the canonical set of registered users
    // and also include any principal that has been assigned a role.
    // Since AccessControl state is opaque we surface what we can from profiles.
    let result = List.empty<(Principal, AccessControl.UserRole)>();
    for ((p, _) in userProfiles.entries()) {
      result.add((p, AccessControl.getUserRole(accessControlState, p)));
    };
    result.toArray();
  };

  // ── Field Visibility ──────────────────────────────────────

  public type FieldVisibilityLevel = {
    #publicField;
    #premiumOnly;
  };

  public type FieldVisibilityConfig = Map.Map<Text, FieldVisibilityLevel>;

  var fieldVisibilityConfig : FieldVisibilityConfig = Map.empty<Text, FieldVisibilityLevel>();

  /// Set visibility for a single field. Admin-only.
  public shared ({ caller }) func setFieldVisibility(field : Text, level : FieldVisibilityLevel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    fieldVisibilityConfig.add(field, level);
  };

  /// Return the full visibility config. Admin-only.
  public query ({ caller }) func getFieldVisibilityConfig() : async [(Text, FieldVisibilityLevel)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    fieldVisibilityConfig.toArray();
  };

  /// Return only the public-facing visibility info (no auth required).
  public query func getPublicFieldVisibility() : async [(Text, FieldVisibilityLevel)] {
    let defaultFields = ["Username", "Position", "Duration", "Shares", "Entry", "Exit", "Potential%"];
    List.fromArray(defaultFields)
      .map<Text, (Text, FieldVisibilityLevel)>(func(field) { (field, #publicField) })
      .toArray();
  };

  // ── Trade Data ────────────────────────────────────────────

  public type NewTradeData = {
    key : Text;
    tradeType : Text;
    position : Text;
    duration : Text;
    shares : Text;
    entry : Text;
    exit : Text;
    potential : Text;
    currentPrice : Text;
    riskPerTrade : Text;
    ratedPerTrade : Text;
    contractNotes : Text;
  };

  let trades = Map.empty<Text, NewTradeData>();

  /// Internal helper — never exposed as a public function.
  /// Filters trade fields based on the caller's role.
  func filterTradeForRole(role : AccessControl.UserRole, trade : NewTradeData) : NewTradeData {
    switch (role) {
      case (#admin) { trade };
      case (#user) {
        // Regular (premium) users see all fields.
        trade
      };
      case (#guest) {
        // Guests only see public fields; premium-only fields are blanked.
        {
          trade with
          riskPerTrade = "";
          ratedPerTrade = "";
          contractNotes = "";
        };
      };
    };
  };

  /// Retrieve a single trade, with field-level visibility applied.
  public query ({ caller }) func getTrade(key : Text) : async ?NewTradeData {
    let role = if (caller.isAnonymous()) { #guest } else {
      AccessControl.getUserRole(accessControlState, caller);
    };
    switch (trades.get(key)) {
      case null { null };
      case (?trade) { ?filterTradeForRole(role, trade) };
    };
  };

  /// List all trades, with field-level visibility applied per caller role.
  public query ({ caller }) func listTrades() : async [NewTradeData] {
    let role = if (caller.isAnonymous()) { #guest } else {
      AccessControl.getUserRole(accessControlState, caller);
    };
    let result = List.empty<NewTradeData>();
    for ((_, trade) in trades.entries()) {
      result.add(filterTradeForRole(role, trade));
    };
    result.toArray();
  };

  /// Add or update a trade. Only authenticated users (non-guest) may write.
  public shared ({ caller }) func saveTrade(trade : NewTradeData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save trades");
    };
    trades.add(trade.key, trade);
  };

  /// Delete a trade. Admin-only.
  public shared ({ caller }) func deleteTrade(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete trades");
    };
    trades.remove(key);
  };
};

