import { useAtom } from "jotai";
import { AllBoardsAtom } from "@core/atoms/atoms.ts";
import { resolveRefs } from "dotnet-json-refs";
import type {
    Board,
    CreateBoardDto,
    UpdateBoardDto
} from "@core/generated-client.ts";
import { BoardsClient } from "@core/generated-client.ts";
import customCatch from "@core/customCatch.ts";
import toast from "react-hot-toast";
import { customFetch } from "@utilities/customFetch.ts";

const isProduction = import.meta.env.PROD;
const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";
const finalUrl = isProduction ? prod : dev;

const boardsApi = new BoardsClient(finalUrl, customFetch);

export default function boardApi() {
    const [boards, setBoards] = useAtom(AllBoardsAtom);

    async function getMyBoards(includeDeleted: boolean = false): Promise<Board[]> {
        try {
            const result = await boardsApi.getMyBoards(includeDeleted);
            const resolvedBoards = resolveRefs(result) as Board[];
            setBoards(resolvedBoards);
            return resolvedBoards;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function createBoard(dto: CreateBoardDto): Promise<Board | null> {
        try {
            console.log("Creating board with DTO:", dto);
            const result = await boardsApi.createBoard(dto);
            console.log("Raw result from API:", result);

            const resolvedBoard = resolveRefs(result) as Board;
            console.log("Resolved board:", resolvedBoard);

            setBoards(prevBoards => {
                const currentBoards = Array.isArray(prevBoards) ? prevBoards : [];
                return [...currentBoards, resolvedBoard];
            });

            toast.success("Board created successfully");
            return resolvedBoard;
        } catch (e: any) {
            console.error("Error creating board:", e);
            customCatch(e);
            return null;
        }
    }

    async function getBoard(id: string): Promise<Board | null> {
        try {
            const result = await boardsApi.getBoard(id);
            return resolveRefs(result) as Board;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function updateBoard(id: string, dto: UpdateBoardDto): Promise<Board | null> {
        try {
            const result = await boardsApi.updateBoard(id, dto);
            const resolvedBoard = resolveRefs(result) as Board;

            const index = boards.findIndex(b => b.id === id);
            if (index > -1) {
                const duplicate = [...boards];
                duplicate[index] = resolvedBoard;
                setBoards(duplicate);
            }

            toast.success("Board updated successfully");
            return resolvedBoard;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function deleteBoard(id: string): Promise<boolean> {
        try {
            await boardsApi.deleteBoard(id);
            const filtered = boards.filter(b => b.id !== id);
            setBoards(filtered);
            toast.success("Board deleted successfully");
            return true;
        } catch (e: any) {
            customCatch(e);
            return false;
        }
    }

    async function getActiveRepeatingBoards(): Promise<Board[]> {
        try {
            const result = await boardsApi.getActiveRepeatingBoards();
            return resolveRefs(result) as Board[];
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getBoardsForCurrentGameWeek(year: number, week: number): Promise<Board[]> {
        try {
            const result = await boardsApi.getBoardsForCurrentGameWeek(year, week);
            return resolveRefs(result) as Board[];
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    return {
        getMyBoards,
        createBoard,
        getBoard,
        updateBoard,
        deleteBoard,
        getActiveRepeatingBoards,
        getBoardsForCurrentGameWeek,
        boards
    };
}