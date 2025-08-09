import { PrismaClient } from '../../generated/prisma';
import { CreateKanbanBoardDto, UpdateKanbanBoardDto } from '../../types/kanban';

const prisma = new PrismaClient();

export class KanbanService {
  async createKanbanBoard(createKanbanBoardDto: CreateKanbanBoardDto) {
    return prisma.kanbanBoard.create({
      data: {
        name: createKanbanBoardDto.name,
        ...(createKanbanBoardDto.projectId && {
          project: { connect: { id: createKanbanBoardDto.projectId } },
        }),
        columns: {
          create: [
            { name: 'To Do', order: 1 },
            { name: 'In Progress', order: 2 },
            { name: 'Done', order: 3 },
          ],
        },
      },
      include: {
        project: true,
        columns: true,
      },
    });
  }

  async getKanbanBoardById(id: number) {
    return prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        project: true,
        columns: {
          include: {
            tasks: {
              include: {
                assignedTo: true,
              },
              orderBy: {
                dueDate: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getKanbanBoardByProject(projectId: number) {
    return prisma.kanbanBoard.findFirst({
      where: { projectId },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                assignedTo: true,
              },
              orderBy: {
                dueDate: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async updateKanbanBoard(id: number, updateKanbanBoardDto: UpdateKanbanBoardDto) {
    return prisma.kanbanBoard.update({
      where: { id },
      data: {
        name: updateKanbanBoardDto.name,
      },
      include: {
        project: true,
        columns: true,
      },
    });
  }

  async deleteKanbanBoard(id: number) {
    return prisma.kanbanBoard.delete({
      where: { id },
    });
  }

  async addColumnToBoard(boardId: number, name: string, order: number) {
    return prisma.kanbanColumn.create({
      data: {
        name,
        order,
        board: { connect: { id: boardId } },
      },
    });
  }

  async updateColumnOrder(boardId: number, columns: { id: number; order: number }[]) {
    const updates = columns.map((column) =>
      prisma.kanbanColumn.update({
        where: { id: column.id },
        data: { order: column.order },
      }),
    );

    return prisma.$transaction(updates);
  }

  async moveTaskToColumn(taskId: number, columnId: number) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        kanbanColumn: { connect: { id: columnId } },
      },
      include: {
        kanbanColumn: true,
      },
    });
  }

  async renameColumn(columnId: number, name: string) {
    return prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { name },
    });
  }

  async deleteColumn(columnId: number) {
    // First, move all tasks to another column or delete them
    // For simplicity, we'll move them to the first available column
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        board: {
          include: {
            columns: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!column) return null;

    const otherColumns = column.board.columns.filter((c) => c.id !== columnId);
    if (otherColumns.length > 0) {
      const firstColumn = otherColumns[0];
      await prisma.task.updateMany({
        where: { kanbanColumnId: columnId },
        data: {
          kanbanColumnId: firstColumn.id,
        },
      });
    }

    return prisma.kanbanColumn.delete({
      where: { id: columnId },
    });
  }
}
