import { atom } from "jotai";
import type {Board, Game, GameStatsDto, Transaction, User} from "../generated-client.ts";

export const AllUsersAtom = atom<User[]>([]);
export const AllTransactionsAtom = atom<Transaction[]>([]);
export const PendingTransactionsAtom = atom<Transaction[]>([]);
export const AllBoardsAtom = atom<Board[]>([]);
export const CurrentUserIdAtom = atom<string | null>(null);
export const IsAuthenticatedAtom = atom<boolean>(false);
export const CurrentUserTokenAtom = atom<string | null>(null);
export const AllGamesAtom = atom<Game[]>([]);
export const CurrentGameAtom = atom<Game | null>(null);
export const GameStatsAtom = atom<GameStatsDto | null>(null);
export const UserBalanceAtom = atom<number>(0);