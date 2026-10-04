/**
 * Multi-User Preference Conflict Detection and Resolution Engine
 * Implements 5 configurable conflict resolution strategies:
 * 1. AVERAGE (Compromise)
 * 2. PRIORITY (Role-weighted / Hierarchical)
 * 3. MAJORITY (Consensus / Mode clustering)
 * 4. ROOM_BASED (Primary resident / Zone affinity)
 * 5. MANUAL (Owner override)
 */

export interface UserPreferenceInput {
  userName: string;
  preferredTemp: number;
  priority: string; // HIGH, NORMAL, LOW
  priorityWeight: number; // e.g. 2.0, 1.0, 0.5
  role?: string;
  isRoomOwner?: boolean;
}

export type ConflictStrategy = 'AVERAGE' | 'PRIORITY' | 'MAJORITY' | 'ROOM_BASED' | 'MANUAL';

export interface ConflictResolutionResult {
  hasConflict: boolean;
  delta: number;
  usersInvolved: string[];
  strategyUsed: ConflictStrategy;
  resolvedTargetTemp: number;
  explanation: string;
  calculationBreakdown: string;
  candidatePreferences: UserPreferenceInput[];
}

export class PreferenceConflictEngine {
  private static conflictSensitivityDelta = 1.5; // Difference in °C that triggers a conflict

  /**
   * Evaluates active user preferences in a zone and detects/resolves conflicts
   */
  public static resolve(
    preferences: UserPreferenceInput[],
    strategy: ConflictStrategy = 'AVERAGE',
    manualTargetOverride?: number,
    roomName: string = 'Living Room'
  ): ConflictResolutionResult {
    // If no users present, return standard default target
    if (!preferences || preferences.length === 0) {
      return {
        hasConflict: false,
        delta: 0,
        usersInvolved: [],
        strategyUsed: strategy,
        resolvedTargetTemp: 24.0,
        explanation: 'No occupants detected in room. Baseline eco default applied (24.0°C).',
        calculationBreakdown: 'Default baseline',
        candidatePreferences: []
      };
    }

    // If single user present, adopt their preferred temperature directly
    if (preferences.length === 1) {
      const user = preferences[0];
      return {
        hasConflict: false,
        delta: 0,
        usersInvolved: [user.userName],
        strategyUsed: strategy,
        resolvedTargetTemp: user.preferredTemp,
        explanation: `Single occupant present (${user.userName}). Setting target to their preferred ${user.preferredTemp}°C without conflict.`,
        calculationBreakdown: `${user.userName} = ${user.preferredTemp}°C`,
        candidatePreferences: preferences
      };
    }

    // Multiple occupants: check for temperature divergence
    const temps = preferences.map(p => p.preferredTemp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const delta = parseFloat((maxTemp - minTemp).toFixed(1));
    const usersInvolved = preferences.map(p => p.userName);

    const hasConflict = delta >= this.conflictSensitivityDelta;

    // Execute resolution strategy
    let resolvedTargetTemp: number;
    let calculationBreakdown = '';
    let explanation = '';

    switch (strategy) {
      case 'AVERAGE': {
        const sum = temps.reduce((acc, t) => acc + t, 0);
        resolvedTargetTemp = parseFloat((sum / temps.length).toFixed(1));
        const expression = preferences.map(p => `${p.userName} (${p.preferredTemp}°C)`).join(' + ');
        calculationBreakdown = `(${temps.join(' + ')}) / ${temps.length} = ${resolvedTargetTemp}°C`;
        explanation = `Compromise Strategy: Calculated arithmetic mean across all active occupants. [${expression}] averaged to ${resolvedTargetTemp}°C.`;
        break;
      }

      case 'PRIORITY': {
        // Weighted sum based on user priority weights
        let totalWeight = 0;
        let weightedSum = 0;
        preferences.forEach(p => {
          const weight = p.priorityWeight > 0 ? p.priorityWeight : (p.priority === 'HIGH' ? 2.0 : p.priority === 'LOW' ? 0.5 : 1.0);
          weightedSum += p.preferredTemp * weight;
          totalWeight += weight;
        });
        resolvedTargetTemp = parseFloat((weightedSum / totalWeight).toFixed(1));
        
        const terms = preferences.map(p => {
          const w = p.priorityWeight > 0 ? p.priorityWeight : (p.priority === 'HIGH' ? 2.0 : p.priority === 'LOW' ? 0.5 : 1.0);
          return `${p.userName} (${p.preferredTemp}°C × ${w})`;
        }).join(' + ');

        calculationBreakdown = `(${terms}) / ${totalWeight} = ${resolvedTargetTemp}°C`;
        explanation = `Priority Strategy: Weighted resolution favoring users with higher priority privileges. Final target set to ${resolvedTargetTemp}°C.`;
        break;
      }

      case 'MAJORITY': {
        // Bucket preferences into 1-degree clusters to find majority mode
        const buckets: Record<number, { count: number; sum: number }> = {};
        preferences.forEach(p => {
          const key = Math.round(p.preferredTemp);
          if (!buckets[key]) buckets[key] = { count: 0, sum: 0 };
          buckets[key].count += 1;
          buckets[key].sum += p.preferredTemp;
        });

        let highestCount = 0;
        let bestClusterSum = 0;
        let clusterCount = 1;

        Object.entries(buckets).forEach(([_, b]) => {
          if (b.count > highestCount) {
            highestCount = b.count;
            bestClusterSum = b.sum;
            clusterCount = b.count;
          }
        });

        resolvedTargetTemp = parseFloat((bestClusterSum / clusterCount).toFixed(1));
        calculationBreakdown = `Consensus cluster with ${highestCount} vote(s) yielding ${resolvedTargetTemp}°C`;
        explanation = `Majority Strategy: Determined modal consensus group among occupants. Target set to ${resolvedTargetTemp}°C.`;
        break;
      }

      case 'ROOM_BASED': {
        // Room-based strategy: User assigned to or owning the room wins
        const roomOwner = preferences.find(p => p.isRoomOwner || p.role === 'HOME_OWNER' || p.priority === 'HIGH') || preferences[0];
        resolvedTargetTemp = roomOwner.preferredTemp;
        calculationBreakdown = `Assigned zone anchor: ${roomOwner.userName} (${roomOwner.preferredTemp}°C)`;
        explanation = `Room-Based Strategy: Preferences anchored to primary zone occupant ${roomOwner.userName}. Target established at ${resolvedTargetTemp}°C.`;
        break;
      }

      case 'MANUAL': {
        // Manual override or Household Owner choice
        if (manualTargetOverride !== undefined && !isNaN(manualTargetOverride)) {
          resolvedTargetTemp = manualTargetOverride;
        } else {
          const ownerPref = preferences.find(p => p.role === 'HOME_OWNER' || p.priority === 'HIGH') || preferences[0];
          resolvedTargetTemp = ownerPref.preferredTemp;
        }
        calculationBreakdown = `Manual Administrator Decision: ${resolvedTargetTemp}°C`;
        explanation = `Manual Strategy: Direct explicit override designated by Home Owner or Administrator (${resolvedTargetTemp}°C).`;
        break;
      }

      default: {
        const sum = temps.reduce((acc, t) => acc + t, 0);
        resolvedTargetTemp = parseFloat((sum / temps.length).toFixed(1));
        calculationBreakdown = `Fallback average = ${resolvedTargetTemp}°C`;
        explanation = `Default compromise applied: ${resolvedTargetTemp}°C.`;
      }
    }

    return {
      hasConflict,
      delta,
      usersInvolved,
      strategyUsed: strategy,
      resolvedTargetTemp,
      explanation,
      calculationBreakdown,
      candidatePreferences: preferences
    };
  }

  /**
   * Simulates all 5 strategies simultaneously for comparison in UI
   */
  public static previewAllStrategies(preferences: UserPreferenceInput[], manualTargetOverride?: number) {
    const strategies: ConflictStrategy[] = ['AVERAGE', 'PRIORITY', 'MAJORITY', 'ROOM_BASED', 'MANUAL'];
    return strategies.map(strategy => this.resolve(preferences, strategy, manualTargetOverride));
  }
}
