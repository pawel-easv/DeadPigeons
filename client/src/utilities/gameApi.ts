import { useAtom } from "jotai";
import { AllGamesAtom, CurrentGameAtom, GameStatsAtom } from "@core/atoms/atoms.ts";
import type { Game, GameStatsDto, CreateGameDto, SetWinningNumbersDto } from "@core/generated-client.ts";
import { GamesClient } from "@core/generated-client.ts";
import customCatch from "@core/customCatch.ts";
import toast from "react-hot-toast";
import { resolveRefs } from "dotnet-json-refs";

const isProduction = import.meta.env.PROD;
const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";
const finalUrl = isProduction ? prod : dev;

class GamesClientWithResolvedRefs extends GamesClient {
    override async getCurrentGame(): Promise<Game> {
        const result = await super.getCurrentGame();
        return resolveRefs(result) as Game;
    }

    override async getAllGames(includeDeleted?: boolean): Promise<Game[]> {
        const result = await super.getAllGames(includeDeleted);
        return resolveRefs(result) as Game[];
    }

    override async getGameById(id?: string): Promise<Game> {
        const result = await super.getGameById(id);
        return resolveRefs(result) as Game;
    }

    override async getGamesByYear(year: number, includeDeleted?: boolean): Promise<Game[]> {
        const result = await super.getGamesByYear(year, includeDeleted);
        return resolveRefs(result) as Game[];
    }

    override async getGameByWeekAndYear(week: number, year: number): Promise<Game> {
        const result = await super.getGameByWeekAndYear(week, year);
        return resolveRefs(result) as Game;
    }

    override async createGame(dto: CreateGameDto): Promise<Game> {
        const result = await super.createGame(dto);
        return resolveRefs(result) as Game;
    }

    override async setWinningNumbers(dto: SetWinningNumbersDto): Promise<Game> {
        const result = await super.setWinningNumbers(dto);
        return resolveRefs(result) as Game;
    }

    override async activateGame(gameId: string): Promise<Game> {
        const result = await super.activateGame(gameId);
        return resolveRefs(result) as Game;
    }

    override async getGameStats(): Promise<GameStatsDto> {
        const result = await super.getGameStats();
        return resolveRefs(result) as GameStatsDto;
    }
}

const gameClient = new GamesClientWithResolvedRefs(finalUrl);

export default function gameApi() {
    const [allGames, setAllGames] = useAtom(AllGamesAtom);
    const [currentGame, setCurrentGame] = useAtom(CurrentGameAtom);
    const [gameStats, setGameStats] = useAtom(GameStatsAtom);

    // GET current active game
    async function getCurrentGame(): Promise<Game | null> {
        try {
            const game = await gameClient.getCurrentGame();
            setCurrentGame(game);
            return game;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function getAllGames(includeDeleted = false): Promise<Game[]> {
        try {
            const games = await gameClient.getAllGames(includeDeleted);
            setAllGames(games);
            return games;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getGameById(id: string): Promise<Game | null> {
        try {
            return await gameClient.getGameById(id);
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function getGamesByYear(year: number, includeDeleted = false): Promise<Game[]> {
        try {
            const games = await gameClient.getGamesByYear(year, includeDeleted);
            return games;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getGameByWeekAndYear(week: number, year: number): Promise<Game | null> {
        try {
            return await gameClient.getGameByWeekAndYear(week, year);
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function createGame(dto: CreateGameDto): Promise<Game | null> {
        try {
            const game = await gameClient.createGame(dto);
            setAllGames((prev) => [...prev, game]);
            toast.success(`Game created: Week ${game.week}/${game.year}`);
            return game;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function setWinningNumbers(dto: SetWinningNumbersDto): Promise<Game | null> {
        try {
            const updatedGame = await gameClient.setWinningNumbers(dto);
            toast.success("Winning numbers saved! Next week activated.");

            setCurrentGame(updatedGame);

            await getAllGames();
            await getCurrentGame();
            await getGameStats();

            return updatedGame;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function activateGame(gameId: string): Promise<Game | null> {
        try {
            const game = await gameClient.activateGame(gameId);
            setCurrentGame(game);
            toast.success(`Game activated: Week ${game.week}/${game.year}`);
            return game;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function deleteGame(id: string, permanent = false): Promise<boolean> {
        try {
            const success = await gameClient.deleteGame(id, permanent);
            if (success) {
                setAllGames((prev) => prev.filter((g) => g.id !== id));
                if (currentGame?.id === id) setCurrentGame(null);
                toast.success(permanent ? "Game permanently deleted" : "Game soft-deleted");
            }
            return success;
        } catch (e: any) {
            customCatch(e);
            return false;
        }
    }

    async function restoreGame(id: string): Promise<boolean> {
        try {
            const success = await gameClient.restoreGame(id);
            if (success) {
                await getAllGames(true);
                toast.success("Game restored");
            }
            return success;
        } catch (e: any) {
            customCatch(e);
            return false;
        }
    }

    async function getGameStats(): Promise<GameStatsDto | null> {
        try {
            const stats = await gameClient.getGameStats();
            setGameStats(stats);
            return stats;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    return {
        allGames,
        currentGame,
        gameStats,

        getCurrentGame,
        getAllGames,
        getGameById,
        getGamesByYear,
        getGameByWeekAndYear,
        createGame,
        setWinningNumbers,
        activateGame,
        deleteGame,
        restoreGame,
        getGameStats,
    };
}