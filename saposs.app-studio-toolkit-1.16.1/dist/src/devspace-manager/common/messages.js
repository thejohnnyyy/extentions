"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = void 0;
exports.messages = {
    lbl_dev_space_explorer_no_dev_spaces: `Could not find any dev spaces in this landscape.`,
    lbl_dev_space_explorer_authentication_failure: `Could not authenticate to landscape.`,
    lbl_dev_space_explorer_loading: `Loading...`,
    lbl_icon_missing: (iconName) => `Could not find an icon named '${iconName}'. Make sure you imported the matching file.`,
    lbl_logged_in: `Logged in`,
    lbl_not_logged_in: `Not logged in`,
    lbl_landscape_context_status: (isLoggedIn) => `landscape-${isLoggedIn ? "log-in" : "log-out"}`,
    lbl_devspace_status_runnig: `running`,
    lbl_devspace_status_not_runnig: `not_running`,
    lbl_devspace_status_error: `error`,
    lbl_devspace_status_transitioning: `transitioning`,
    lbl_devspace_context_runnig: `dev-space-running`,
    lbl_devspace_context_stopped: `dev-space-stopped`,
    lbl_devspace_context_transitioning: `dev-space-transitioning`,
    lbl_devspace_context_error: `dev-space-error`,
    lbl_delete_landscape: (label) => `Are you sure you want to delete the '${label}' landscape?`,
    lbl_delete_devspace: (label, id) => ` Are you sure you want to delete the '${label}' (${id}) dev space?`,
    lbl_yes: `Yes`,
    lbl_no: `No`,
    err_incorrect_jwt: (url) => `Incorrect token recieved for ${url}. Login failed.`,
    err_listening: (message, url) => `An error occurred while listening for the JWT: ${message} for ${url}`,
    err_get_jwt_timeout: (ms) => `Login time out in ${ms} ms.`,
    err_get_jwt_not_exists: `Personal Access Token does not exist.`,
    err_get_jwt_required: `Personal Access Token is required`,
    err_open_devspace_in_bas: (landscapeUrl, err) => `Cannot open the devspace ${landscapeUrl}: ${err} .`,
    err_copy_devspace_id: (err) => `Cannot copy the dev space ID: ${err}}`,
    err_assert_unreachable: `Unexpected error.`,
    err_get_devspace: (message) => `Failed to get dev spaces, ${message}`,
    err_devspace_delete: (wsId, reason) => `Could not delete '${wsId}': ${reason}`,
    err_ws_update: (wsId, reason) => `Could not update the ${wsId}  dev space, ${reason}`,
    err_name_validation: `The name may contain alphanumeric charcters or undrscores. It must start with an alphanumeric character. Special characters can't be used.`,
    err_no_devspaces_in_landscape: (landscape) => `There are no devspaces in this landscape '${landscape}'`,
    err_devspace_missing: (id) => `Devspace '${id}' is missing`,
    err_devspace_must_be_started: `DevSpace must be started before running it`,
    err_landscape_not_added: (landscape) => `Falied to add landscape '${landscape}'`,
    err_url_param_missing: (query, name) => `${name} parameter is missing from URL query '${query}'`,
    err_url_has_incorrect_format: (url) => `URL ${url} has incorrect format`,
    err_open_devspace_in_code: (reason) => `Can't open the devspace: ${reason}`,
    info_devspace_state_updated: (wsName, wsId, suspend) => `The ${wsName} (${wsId}) dev space was ${suspend ? "stopped" : "started"}`,
    info_wsid_copied: `The dev space ID was copied to the clipboard.`,
    info_devspace_deleted: (wsId) => `The '${wsId}' dev space has been deleted.`,
    info_can_run_only_2_devspaces: `You can only run 2 dev spaces at a time. To run another dev space, you must stop a running one.`,
};
//# sourceMappingURL=messages.js.map