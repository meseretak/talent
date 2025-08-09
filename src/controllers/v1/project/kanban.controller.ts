import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { KanbanService } from '../../../services/project/kanban.service';
import catchAsync from '../../../utils/catchAsync';

const kanbanService = new KanbanService();

export class KanbanController {
  createKanbanBoard = catchAsync(async (req: Request, res: Response) => {
    const board = await kanbanService.createKanbanBoard(req.body);
    res.status(httpStatus.CREATED).json(board);
  });

  getKanbanBoardById = catchAsync(async (req: Request, res: Response) => {
    const board = await kanbanService.getKanbanBoardById(Number(req.params.id));
    if (!board) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Kanban board not found' });
      return;
    }
    res.json(board);
  });

  getKanbanBoardByProject = catchAsync(async (req: Request, res: Response) => {
    const board = await kanbanService.getKanbanBoardByProject(Number(req.params.projectId));
    if (!board) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Kanban board not found for this project' });
      return;
    }
    res.json(board);
  });

  updateKanbanBoard = catchAsync(async (req: Request, res: Response) => {
    const board = await kanbanService.updateKanbanBoard(Number(req.params.id), req.body);
    if (!board) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Kanban board not found' });
      return;
    }
    res.json(board);
  });

  deleteKanbanBoard = catchAsync(async (req: Request, res: Response) => {
    await kanbanService.deleteKanbanBoard(Number(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
  });

  addColumnToBoard = catchAsync(async (req: Request, res: Response) => {
    const { name, order } = req.body;
    const column = await kanbanService.addColumnToBoard(
      Number(req.params.boardId),
      name,
      Number(order),
    );
    res.status(httpStatus.CREATED).json(column);
  });

  updateColumnOrder = catchAsync(async (req: Request, res: Response) => {
    const { columns } = req.body;
    const updatedColumns = await kanbanService.updateColumnOrder(
      Number(req.params.boardId),
      columns.map((col: any) => ({
        id: Number(col.id),
        order: Number(col.order),
      })),
    );
    res.json(updatedColumns);
  });

  moveTaskToColumn = catchAsync(async (req: Request, res: Response) => {
    const { columnId } = req.body;
    const task = await kanbanService.moveTaskToColumn(Number(req.params.taskId), Number(columnId));
    res.json(task);
  });

  renameColumn = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const column = await kanbanService.renameColumn(Number(req.params.columnId), name);
    res.json(column);
  });

  deleteColumn = catchAsync(async (req: Request, res: Response) => {
    const result = await kanbanService.deleteColumn(Number(req.params.columnId));
    if (!result) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Column not found' });
      return;
    }
    res.status(httpStatus.NO_CONTENT).send();
  });
}

export default new KanbanController();
