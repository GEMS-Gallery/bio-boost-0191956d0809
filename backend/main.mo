import Hash "mo:base/Hash";
import Nat "mo:base/Nat";

import Float "mo:base/Float";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor {
  type BiometricData = {
    weight: ?Float;
    heartRate: ?Float;
    sleepDuration: ?Float;
    timestamp: Time.Time;
  };

  stable var biometricDataEntries : [(Text, BiometricData)] = [];
  var dataEntryCount : Nat = 0;
  let biometricData = HashMap.fromIter<Text, BiometricData>(biometricDataEntries.vals(), 0, Text.equal, Text.hash);

  public func addBiometricData(weight: ?Float, heartRate: ?Float, sleepDuration: ?Float) : async Result.Result<Text, Text> {
    let timestamp = Time.now();
    let id = Int.toText(timestamp) # "-" # Int.toText(dataEntryCount);
    let entry : BiometricData = {
      weight;
      heartRate;
      sleepDuration;
      timestamp;
    };
    biometricData.put(id, entry);
    dataEntryCount += 1;
    #ok("Data added successfully")
  };

  public query func getBiometricData(start: Time.Time, end: Time.Time) : async [BiometricData] {
    Array.filter<BiometricData>(Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(biometricData.entries()), func(entry) { entry.1 }), func(data) {
      data.timestamp >= start and data.timestamp <= end
    })
  };

  public query func getLatestBiometricData() : async ?BiometricData {
    if (dataEntryCount == 0) {
      return null;
    };
    let entries = Array.sort<BiometricData>(Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(biometricData.entries()), func(entry) { entry.1 }), func(a, b) {
      if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) { #greater } else { #equal }
    });
    ?entries[0]
  };

  public query func getAggregatedData() : async {
    avgWeight: ?Float;
    avgHeartRate: ?Float;
    avgSleepDuration: ?Float;
  } {
    let entries = Array.map<(Text, BiometricData), BiometricData>(Iter.toArray(biometricData.entries()), func(entry) { entry.1 });
    let weightData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.weight });
    let heartRateData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.heartRate });
    let sleepData = Array.mapFilter<BiometricData, Float>(entries, func(entry) { entry.sleepDuration });

    {
      avgWeight = if (weightData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(weightData, 0, Float.add), Float.fromInt(weightData.size())) else null;
      avgHeartRate = if (heartRateData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(heartRateData, 0, Float.add), Float.fromInt(heartRateData.size())) else null;
      avgSleepDuration = if (sleepData.size() > 0) ?Float.div(Array.foldLeft<Float, Float>(sleepData, 0, Float.add), Float.fromInt(sleepData.size())) else null;
    }
  };

  system func preupgrade() {
    biometricDataEntries := Iter.toArray(biometricData.entries());
  };

  system func postupgrade() {
    dataEntryCount := biometricDataEntries.size();
  };
}
