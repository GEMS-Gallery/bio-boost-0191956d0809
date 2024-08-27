import Hash "mo:base/Hash";

import Float "mo:base/Float";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

actor {
  type BiometricData = {
    weight: ?Float;
    heartRate: ?Float;
    sleepDuration: ?Float;
    timestamp: Time.Time;
  };

  stable var biometricDataEntries : [(Principal, [(Text, BiometricData)])] = [];
  var biometricData = HashMap.HashMap<Principal, HashMap.HashMap<Text, BiometricData>>(0, Principal.equal, Principal.hash);

  public shared(msg) func addBiometricData(weight: ?Float, heartRate: ?Float, sleepDuration: ?Float) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let timestamp = Time.now();
    let id = Int.toText(timestamp);
    let entry : BiometricData = {
      weight;
      heartRate;
      sleepDuration;
      timestamp;
    };
    
    switch (biometricData.get(caller)) {
      case null {
        let newUserData = HashMap.HashMap<Text, BiometricData>(0, Text.equal, Text.hash);
        newUserData.put(id, entry);
        biometricData.put(caller, newUserData);
      };
      case (?userData) {
        userData.put(id, entry);
      };
    };
    
    #ok("Data added successfully")
  };

  public query(msg) func getBiometricData(start: Time.Time, end: Time.Time) : async [BiometricData] {
    let caller = msg.caller;
    switch (biometricData.get(caller)) {
      case null { [] };
      case (?userData) {
        Array.filter<BiometricData>(Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(userData.entries()), func(entry) { entry.1 }), func(data) {
          data.timestamp >= start and data.timestamp <= end
        })
      };
    }
  };

  public query(msg) func getLatestBiometricData() : async ?BiometricData {
    let caller = msg.caller;
    switch (biometricData.get(caller)) {
      case null { null };
      case (?userData) {
        if (userData.size() == 0) {
          return null;
        };
        let entries = Array.sort<BiometricData>(Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(userData.entries()), func(entry) { entry.1 }), func(a, b) {
          if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) { #greater } else { #equal }
        });
        ?entries[0]
      };
    }
  };

  public query(msg) func getAggregatedData() : async {
    avgWeight: ?Float;
    avgHeartRate: ?Float;
    avgSleepDuration: ?Float;
  } {
    let caller = msg.caller;
    switch (biometricData.get(caller)) {
      case null { { avgWeight = null; avgHeartRate = null; avgSleepDuration = null } };
      case (?userData) {
        let entries = Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(userData.entries()), func(entry) { entry.1 });
        let weightData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.weight });
        let heartRateData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.heartRate });
        let sleepData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.sleepDuration });

        {
          avgWeight = if (weightData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(weightData, 0, Float.add), Float.fromInt(weightData.size())) else null;
          avgHeartRate = if (heartRateData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(heartRateData, 0, Float.add), Float.fromInt(heartRateData.size())) else null;
          avgSleepDuration = if (sleepData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(sleepData, 0, Float.add), Float.fromInt(sleepData.size())) else null;
        }
      };
    }
  };

  system func preupgrade() {
    biometricDataEntries := Array.map<(Principal, HashMap.HashMap<Text, BiometricData>), (Principal, [(Text, BiometricData)])>
      (Iter.toArray(biometricData.entries()), func ((p, userData) : (Principal, HashMap.HashMap<Text, BiometricData>)) : (Principal, [(Text, BiometricData)]) {
        (p, Iter.toArray(userData.entries()))
      });
  };

  system func postupgrade() {
    biometricData := HashMap.fromIter<Principal, HashMap.HashMap<Text, BiometricData>>(
      Array.map<(Principal, [(Text, BiometricData)]), (Principal, HashMap.HashMap<Text, BiometricData>)>
        (biometricDataEntries, func ((p, entries) : (Principal, [(Text, BiometricData)])) : (Principal, HashMap.HashMap<Text, BiometricData>) {
          (p, HashMap.fromIter<Text, BiometricData>(entries.vals(), 0, Text.equal, Text.hash))
        }).vals(),
      0, Principal.equal, Principal.hash
    );
  };
}
