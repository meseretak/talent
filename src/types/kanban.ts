export interface CreateKanbanBoardDto {
  name: string;
  projectId?: number;
  columns?: KanbanColumnDto[];
}

export interface UpdateKanbanBoardDto {
  name?: string;
  projectId?: number;
}

export interface KanbanColumnDto {
  name: string;
  order: number;
}

export interface MoveTaskToColumnDto {
  taskId: number;
  columnId: number;
}

export interface ReorderColumnsDto {
  columns: {
    id: number;
    order: number;
  }[];
}

export interface KanbanFilterDto {
  projectId?: number;
}
