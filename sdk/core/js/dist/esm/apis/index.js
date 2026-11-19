"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
/* eslint-disable */
__exportStar(require("./V1AuthApi"), exports);
__exportStar(require("./V1ConfigurationApi"), exports);
__exportStar(require("./V1DatabaseApi"), exports);
__exportStar(require("./V1PaymentsApi"), exports);
__exportStar(require("./V1PermissionsApi"), exports);
__exportStar(require("./V1StorageApi"), exports);
__exportStar(require("./V1StripeApi"), exports);
__exportStar(require("./V1TenantsInvitesApi"), exports);
__exportStar(require("./V1TenantsLifecycleApi"), exports);
__exportStar(require("./V1TenantsRolesApi"), exports);
__exportStar(require("./V1TenantsSubscriptionsApi"), exports);
__exportStar(require("./V1TenantsUsersApi"), exports);
