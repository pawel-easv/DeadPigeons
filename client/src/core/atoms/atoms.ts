import { atom } from "jotai";
import type { Board, User } from "../generated-client.ts";

export const AllUsersAtom = atom<User[]>([]);
export const AllBoardsAtom = atom<Board[]>([]);
export const CurrentUserIdAtom = atom<string | null>(null);
export const IsAuthenticatedAtom = atom<boolean>(false);