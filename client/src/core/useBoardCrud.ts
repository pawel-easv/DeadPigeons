import { useAtom } from "jotai";
import { AllBoardsAtom } from "@core/atoms/atoms.ts";
import type {
    Board,
    CreateBoardDto,
    UpdateBoardDto
} from "./generated-client.ts";
import { BoardsClient } from "./generated-client.ts";
import customCatch from "./customCatch.ts";
import toast from "react-hot-toast";

const isProduction = import.meta.env.PROD;

const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";

const finalUrl = isProduction ? prod : dev;

const boardsApi = new BoardsClient(finalUrl);

export default function useBoardCrud() {

    const [boards, setBoards] = useAtom(AllBoardsAtom);

    async function getMyBoards(includeDeleted: boolean = false) {
        try {
            const result = await boardsApi.getMyBoards(includeDeleted);
            setBoards(result);
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function createBoard(dto: CreateBoardDto) {
        try {
            const result = await boardsApi.createBoard(dto);
            const duplicate = [...boards];
            duplicate.push(result);
            setBoards(duplicate);
            toast.success("Board created successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getBoard(id: string) {
        try {
            const result = await boardsApi.getBoard(id);
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function updateBoard(id: string, dto: UpdateBoardDto) {
        try {
            const result = await boardsApi.updateBoard(id, dto);
            const index = boards.findIndex(b => b.id === id);
            if (index > -1) {
                const duplicate = [...boards];
                duplicate[index] = result;
                setBoards(duplicate);
            }
            toast.success("Board updated successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function deleteBoard(id: string) {
        try {
            const result = await boardsApi.deleteBoard(id);
            const filtered = boards.filter(b => b.id !== id);
            setBoards(filtered);
            toast.success("Board deleted successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getActiveRepeatingBoards() {
        try {
            const result = await boardsApi.getActiveRepeatingBoards();
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getBoardsForCurrentGameWeek(year: number, week: number) {
        try {
            const result = await boardsApi.getBoardsForCurrentGameWeek(year, week);
            return result;
        } catch (e: any) {
            customCatch(e);
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