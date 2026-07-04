import * as migration_20260704_002757_initial_payload_foundation from './20260704_002757_initial_payload_foundation';
import * as migration_20260704_010154_rename_retreat_lifecycle_status from './20260704_010154_rename_retreat_lifecycle_status';
import * as migration_20260704_012346_add_lone_star_participant_profiles from './20260704_012346_add_lone_star_participant_profiles';
import * as migration_20260704_015331_add_lone_star_applications from './20260704_015331_add_lone_star_applications';

export const migrations = [
  {
    up: migration_20260704_002757_initial_payload_foundation.up,
    down: migration_20260704_002757_initial_payload_foundation.down,
    name: '20260704_002757_initial_payload_foundation',
  },
  {
    up: migration_20260704_010154_rename_retreat_lifecycle_status.up,
    down: migration_20260704_010154_rename_retreat_lifecycle_status.down,
    name: '20260704_010154_rename_retreat_lifecycle_status',
  },
  {
    up: migration_20260704_012346_add_lone_star_participant_profiles.up,
    down: migration_20260704_012346_add_lone_star_participant_profiles.down,
    name: '20260704_012346_add_lone_star_participant_profiles',
  },
  {
    up: migration_20260704_015331_add_lone_star_applications.up,
    down: migration_20260704_015331_add_lone_star_applications.down,
    name: '20260704_015331_add_lone_star_applications'
  },
];
