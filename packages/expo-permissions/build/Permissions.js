import { Platform } from 'react-native';
import { coalesceExpirations, coalesceStatuses, coalesceCanAskAgain, coalesceGranted, } from './CoalescedPermissions';
import Permissions from './ExpoPermissions';
import { PermissionStatus, } from './Permissions.types';
export { PermissionStatus, };
export const CAMERA = 'camera';
export const CAMERA_ROLL = 'cameraRoll';
export const AUDIO_RECORDING = 'audioRecording';
export const LOCATION = 'location';
export const USER_FACING_NOTIFICATIONS = 'userFacingNotifications';
export const NOTIFICATIONS = 'notifications';
export const CONTACTS = 'contacts';
export const CALENDAR = 'calendar';
export const REMINDERS = 'reminders';
export const SYSTEM_BRIGHTNESS = 'systemBrightness';
export const MOTION = 'motion';
export async function getAsync(...types) {
    if (Platform.OS === 'ios') {
        return await _handleMultiPermissionsRequestIOSAsync(types, Permissions.getAsync);
    }
    return await _handlePermissionsRequestAsync(types, Permissions.getAsync);
}
export async function askAsync(...types) {
    if (Platform.OS === 'ios') {
        return await _handleMultiPermissionsRequestIOSAsync(types, Permissions.askAsync);
    }
    return await _handlePermissionsRequestAsync(types, Permissions.askAsync);
}
async function _handleSinglePermissionRequestIOSAsync(type, handlePermission) {
    if (Platform.OS !== 'web' && type === 'motion') {
        return {
            status: PermissionStatus.GRANTED,
            expires: 'never',
            granted: true,
            canAskAgain: true,
        };
    }
    return await handlePermission(type);
}
async function _handleMultiPermissionsRequestIOSAsync(types, handlePermission) {
    if (!types.length) {
        throw new Error('At least one permission type must be specified');
    }
    const permissions = {};
    for (const type of types) {
        permissions[type] = await _handleSinglePermissionRequestIOSAsync(type, handlePermission);
    }
    return {
        status: coalesceStatuses(permissions),
        expires: coalesceExpirations(permissions),
        canAskAgain: coalesceCanAskAgain(permissions),
        granted: coalesceGranted(permissions),
        permissions,
    };
}
async function _handlePermissionsRequestAsync(types, handlePermissions) {
    if (!types.length) {
        throw new Error('At least one permission type must be specified');
    }
    if (Platform.OS !== 'web' && types.length === 1 && types[0] === 'motion') {
        const approvedPermission = {
            status: PermissionStatus.GRANTED,
            expires: 'never',
            granted: true,
            canAskAgain: true,
        };
        return {
            ...approvedPermission,
            // @ts-ignore
            permissions: { motion: approvedPermission },
        };
    }
    const permissions = await handlePermissions(types);
    return {
        status: coalesceStatuses(permissions),
        expires: coalesceExpirations(permissions),
        canAskAgain: coalesceCanAskAgain(permissions),
        granted: coalesceGranted(permissions),
        permissions,
    };
}
//# sourceMappingURL=Permissions.js.map