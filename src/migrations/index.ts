import * as migration_20260704_002757_initial_payload_foundation from './20260704_002757_initial_payload_foundation';
import * as migration_20260704_010154_rename_retreat_lifecycle_status from './20260704_010154_rename_retreat_lifecycle_status';
import * as migration_20260704_012346_add_lone_star_participant_profiles from './20260704_012346_add_lone_star_participant_profiles';
import * as migration_20260704_015331_add_lone_star_applications from './20260704_015331_add_lone_star_applications';
import * as migration_20260704_023841_add_public_application_protections from './20260704_023841_add_public_application_protections';
import * as migration_20260704_040357_refine_model_creative_interests from './20260704_040357_refine_model_creative_interests';
import * as migration_20260704_042015_add_application_marketing_attribution from './20260704_042015_add_application_marketing_attribution';
import * as migration_20260704_054212_make_photographer_equipment_optional from './20260704_054212_make_photographer_equipment_optional';
import * as migration_20260704_055322_make_photographer_display_name_optional from './20260704_055322_make_photographer_display_name_optional';
import * as migration_20260704_155241 from './20260704_155241';
import * as migration_20260704_165148 from './20260704_165148';
import * as migration_20260704_203156 from './20260704_203156';
import * as migration_20260705_043634_scheduling_data_model from './20260705_043634_scheduling_data_model';
import * as migration_20260705_044709_event_scheduling_timezone from './20260705_044709_event_scheduling_timezone';
import * as migration_20260706_062709_identity_access_foundation from './20260706_062709_identity_access_foundation';
import * as migration_20260706_211702_account_lifecycle_security from './20260706_211702_account_lifecycle_security';
import * as migration_20260709_025300_add_media_blob_prefix from './20260709_025300_add_media_blob_prefix';
import * as migration_20260710_031800_application_form_ux_refinements from './20260710_031800_application_form_ux_refinements';

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
    name: '20260704_015331_add_lone_star_applications',
  },
  {
    up: migration_20260704_023841_add_public_application_protections.up,
    down: migration_20260704_023841_add_public_application_protections.down,
    name: '20260704_023841_add_public_application_protections',
  },
  {
    up: migration_20260704_040357_refine_model_creative_interests.up,
    down: migration_20260704_040357_refine_model_creative_interests.down,
    name: '20260704_040357_refine_model_creative_interests',
  },
  {
    up: migration_20260704_042015_add_application_marketing_attribution.up,
    down: migration_20260704_042015_add_application_marketing_attribution.down,
    name: '20260704_042015_add_application_marketing_attribution',
  },
  {
    up: migration_20260704_054212_make_photographer_equipment_optional.up,
    down: migration_20260704_054212_make_photographer_equipment_optional.down,
    name: '20260704_054212_make_photographer_equipment_optional',
  },
  {
    up: migration_20260704_055322_make_photographer_display_name_optional.up,
    down: migration_20260704_055322_make_photographer_display_name_optional.down,
    name: '20260704_055322_make_photographer_display_name_optional',
  },
  {
    up: migration_20260704_155241.up,
    down: migration_20260704_155241.down,
    name: '20260704_155241',
  },
  {
    up: migration_20260704_165148.up,
    down: migration_20260704_165148.down,
    name: '20260704_165148',
  },
  {
    up: migration_20260704_203156.up,
    down: migration_20260704_203156.down,
    name: '20260704_203156',
  },
  {
    up: migration_20260705_043634_scheduling_data_model.up,
    down: migration_20260705_043634_scheduling_data_model.down,
    name: '20260705_043634_scheduling_data_model',
  },
  {
    up: migration_20260705_044709_event_scheduling_timezone.up,
    down: migration_20260705_044709_event_scheduling_timezone.down,
    name: '20260705_044709_event_scheduling_timezone',
  },
  {
    up: migration_20260706_062709_identity_access_foundation.up,
    down: migration_20260706_062709_identity_access_foundation.down,
    name: '20260706_062709_identity_access_foundation',
  },
  {
    up: migration_20260706_211702_account_lifecycle_security.up,
    down: migration_20260706_211702_account_lifecycle_security.down,
    name: '20260706_211702_account_lifecycle_security'
  },
  {
    up: migration_20260709_025300_add_media_blob_prefix.up,
    down: migration_20260709_025300_add_media_blob_prefix.down,
    name: '20260709_025300_add_media_blob_prefix',
  },
  {
    up: migration_20260710_031800_application_form_ux_refinements.up,
    down: migration_20260710_031800_application_form_ux_refinements.down,
    name: '20260710_031800_application_form_ux_refinements',
  },
];
