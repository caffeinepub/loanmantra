import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Data Types
  public type Lender = {
    id : Nat;
    name : Text;
    category : Text;
    interestRate : Text;
    maxAmount : Nat;
    processingFee : Text;
    badges : [Text];
    minCibil : Nat;
  };

  public type Lead = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    salary : Text;
    age : Nat;
    pan : Text;
    cibil : Nat;
    loanAmount : Nat;
    selectedLenders : [Text];
    timestamp : Int;
    callStatus : CallStatus;
    abVariant : Text;
  };

  public type CallStatus = {
    #pending;
    #contacted;
    #closed;
    #converted;
  };

  module Lead {
    public func compare(lead1 : Lead, lead2 : Lead) : Order.Order {
      Nat.compare(lead1.id, lead2.id);
    };
  };

  public type ABTestVariants = {
    variantA : Nat;
    variantB : Nat;
    variantC : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type LeadsStats = {
    totalLeads : Nat;
    convertedCount : Nat;
    totalRevenueEstimate : Nat;
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent State
  let leads = Map.empty<Nat, Lead>();
  let lenders = Map.empty<Nat, Lender>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextLeadId = 1;
  var testVariants : ABTestVariants = {
    variantA = 0;
    variantB = 0;
    variantC = 0;
  };

  // User Profile Methods
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

  // AB Testing Methods
  public shared func recordVariant(variant : Text) : async () {
    testVariants := switch (variant) {
      case ("A") {
        {
          variantA = testVariants.variantA + 1;
          variantB = testVariants.variantB;
          variantC = testVariants.variantC;
        };
      };
      case ("B") {
        {
          variantA = testVariants.variantA;
          variantB = testVariants.variantB + 1;
          variantC = testVariants.variantC;
        };
      };
      case ("C") {
        {
          variantA = testVariants.variantA;
          variantB = testVariants.variantB;
          variantC = testVariants.variantC + 1;
        };
      };
      case (_) { Runtime.trap("Invalid variant") };
    };
  };

  public query ({ caller }) func getVariantStats() : async ABTestVariants {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    testVariants;
  };

  // Lender Methods
  public query func getLenders() : async [Lender] {
    lenders.values().toArray().sort(func(l1, l2) { Nat.compare(l1.id, l2.id) });
  };

  public query func getLendersByCibil(minCibil : Nat) : async [Lender] {
    lenders.values().toArray().filter(
      func(l) { l.minCibil <= minCibil }
    );
  };

  // Lead Management Methods
  public shared func submitLead(
    name : Text,
    phone : Text,
    email : Text,
    salary : Text,
    age : Nat,
    pan : Text,
    cibil : Nat,
    loanAmount : Nat,
    selectedLenders : [Text],
    abVariant : Text,
  ) : async Nat {
    let lead : Lead = {
      id = nextLeadId;
      name;
      phone;
      email;
      salary;
      age;
      pan;
      cibil;
      loanAmount;
      selectedLenders;
      timestamp = Time.now();
      callStatus = #pending;
      abVariant;
    };

    leads.add(nextLeadId, lead);
    let retId = nextLeadId;
    nextLeadId += 1;
    retId;
  };

  public shared ({ caller }) func updateLeadStatus(leadId : Nat, status : CallStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    switch (leads.get(leadId)) {
      case (?lead) {
        let updatedLead = {
          id = lead.id;
          name = lead.name;
          phone = lead.phone;
          email = lead.email;
          salary = lead.salary;
          age = lead.age;
          pan = lead.pan;
          cibil = lead.cibil;
          loanAmount = lead.loanAmount;
          selectedLenders = lead.selectedLenders;
          timestamp = lead.timestamp;
          callStatus = status;
          abVariant = lead.abVariant;
        };
        leads.add(leadId, updatedLead);
      };
      case (null) { Runtime.trap("Lead not found") };
    };
  };

  public query ({ caller }) func getLeads() : async [Lead] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    leads.values().toArray().sort();
  };

  public query ({ caller }) func getLeadsStats() : async LeadsStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    var totalLeads = 0;
    var convertedCount = 0;
    var totalRevenueEstimate = 0;

    for (lead in leads.values()) {
      totalLeads += 1;
      switch (lead.callStatus) {
        case (#converted) {
          convertedCount += 1;
          // Estimate revenue as 2% of loan amount (average processing fee)
          totalRevenueEstimate += lead.loanAmount * 2 / 100;
        };
        case (_) {};
      };
    };

    {
      totalLeads;
      convertedCount;
      totalRevenueEstimate;
    };
  };

  // Initialize Lenders
  public shared ({ caller }) func initLenders() : async () {
    let lendersList = List.empty<Lender>();

    lendersList.add({
      id = 1;
      name = "MoneyView";
      category = "Personal";
      interestRate = "1.33%/mo";
      maxAmount = 500_000;
      processingFee = "2%";
      badges = ["Fast Approval"];
      minCibil = 650;
    });

    lendersList.add({
      id = 2;
      name = "KreditBee";
      category = "Personal";
      interestRate = "1.5%/mo";
      maxAmount = 300_000;
      processingFee = "2.5%";
      badges = ["Online Process"];
      minCibil = 600;
    });

    lendersList.add({
      id = 3;
      name = "CASHe";
      category = "Personal";
      interestRate = "1.75%/mo";
      maxAmount = 200_000;
      processingFee = "3%";
      badges = ["Instant Disbursal"];
      minCibil = 600;
    });

    lendersList.add({
      id = 4;
      name = "Loan112";
      category = "Personal";
      interestRate = "1.25%/mo";
      maxAmount = 500_000;
      processingFee = "1.5%";
      badges = ["Low Interest"];
      minCibil = 680;
    });

    lendersList.add({
      id = 5;
      name = "MoneyTap";
      category = "Personal";
      interestRate = "1.08%/mo";
      maxAmount = 500_000;
      processingFee = "2%";
      badges = ["Flexible Tenure"];
      minCibil = 700;
    });

    lendersList.add({
      id = 6;
      name = "HDFC Bank";
      category = "Personal";
      interestRate = "0.83%/mo";
      maxAmount = 4_000_000;
      processingFee = "1.5%";
      badges = ["Trusted Bank"];
      minCibil = 750;
    });

    lendersList.add({
      id = 7;
      name = "ICICI Bank";
      category = "Personal";
      interestRate = "0.875%/mo";
      maxAmount = 2_000_000;
      processingFee = "1%";
      badges = ["Fast Processing"];
      minCibil = 750;
    });

    lendersList.add({
      id = 8;
      name = "Axis Bank";
      category = "Personal";
      interestRate = "0.917%/mo";
      maxAmount = 1_500_000;
      processingFee = "1.5%";
      badges = ["Wide Reach"];
      minCibil = 750;
    });

    lendersList.add({
      id = 9;
      name = "Bajaj Finserv";
      category = "Personal";
      interestRate = "1.08%/mo";
      maxAmount = 2_500_000;
      processingFee = "1.5%";
      badges = ["Flexible Loans"];
      minCibil = 720;
    });

    lendersList.add({
      id = 10;
      name = "Fullerton";
      category = "Personal";
      interestRate = "1.25%/mo";
      maxAmount = 2_500_000;
      processingFee = "2%";
      badges = ["Quick Approval"];
      minCibil = 700;
    });

    lendersList.add({
      id = 11;
      name = "Tata Capital";
      category = "Personal";
      interestRate = "1%/mo";
      maxAmount = 3_500_000;
      processingFee = "1%";
      badges = ["Low Interest"];
      minCibil = 720;
    });

    lendersList.add({
      id = 12;
      name = "Kotak Bank";
      category = "Personal";
      interestRate = "0.917%/mo";
      maxAmount = 2_000_000;
      processingFee = "1.5%";
      badges = ["Trusted Brand"];
      minCibil = 740;
    });

    lendersList.add({
      id = 13;
      name = "IndusInd";
      category = "Personal";
      interestRate = "1%/mo";
      maxAmount = 1_500_000;
      processingFee = "1.5%";
      badges = ["Fast Approval"];
      minCibil = 720;
    });

    lendersList.add({
      id = 14;
      name = "SBI";
      category = "Home";
      interestRate = "0.733%/mo";
      maxAmount = 50_000_000;
      processingFee = "0.5%";
      badges = ["Government Bank"];
      minCibil = 750;
    });

    lendersList.add({
      id = 15;
      name = "HDFC Home";
      category = "Home";
      interestRate = "0.742%/mo";
      maxAmount = 50_000_000;
      processingFee = "0.5%";
      badges = ["Trusted Brand"];
      minCibil = 740;
    });

    lendersList.add({
      id = 16;
      name = "LIC HFL";
      category = "Home";
      interestRate = "0.742%/mo";
      maxAmount = 20_000_000;
      processingFee = "0.5%";
      badges = ["Trustworthy"];
      minCibil = 730;
    });

    lendersList.add({
      id = 17;
      name = "Muthoot Finance";
      category = "Gold";
      interestRate = "0.833%/mo";
      maxAmount = 5_000_000;
      processingFee = "0.5%";
      badges = ["Gold Loan"];
      minCibil = 0;
    });

    lendersList.add({
      id = 18;
      name = "IIFL Gold";
      category = "Gold";
      interestRate = "0.792%/mo";
      maxAmount = 5_000_000;
      processingFee = "0.25%";
      badges = ["Gold Loan"];
      minCibil = 0;
    });

    lendersList.add({
      id = 19;
      name = "Manappuram";
      category = "Gold";
      interestRate = "0.875%/mo";
      maxAmount = 5_000_000;
      processingFee = "0.5%";
      badges = ["Gold Loan"];
      minCibil = 0;
    });

    lendersList.add({
      id = 20;
      name = "Lendingkart";
      category = "Business";
      interestRate = "1.25%/mo";
      maxAmount = 20_000_000;
      processingFee = "2%";
      badges = ["Business Loans"];
      minCibil = 650;
    });

    for (lender in lendersList.values()) {
      lenders.add(lender.id, lender);
    };
  };
};
