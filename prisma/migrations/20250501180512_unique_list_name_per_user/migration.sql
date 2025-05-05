/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `TodoList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TodoList_name_userId_key" ON "TodoList"("name", "userId");
