import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BiometricData {
  'weight' : [] | [number],
  'heartRate' : [] | [number],
  'timestamp' : Time,
  'sleepDuration' : [] | [number],
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Time = bigint;
export interface _SERVICE {
  'addBiometricData' : ActorMethod<
    [[] | [number], [] | [number], [] | [number]],
    Result
  >,
  'getAggregatedData' : ActorMethod<
    [],
    {
      'avgWeight' : [] | [number],
      'avgSleepDuration' : [] | [number],
      'avgHeartRate' : [] | [number],
    }
  >,
  'getBiometricData' : ActorMethod<[Time, Time], Array<BiometricData>>,
  'getLatestBiometricData' : ActorMethod<[], [] | [BiometricData]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
