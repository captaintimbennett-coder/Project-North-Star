import type { Access } from "payload";
import { isActiveAccount } from "./account";

export const authenticated: Access = ({ req }) => isActiveAccount(req.user);
