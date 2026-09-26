-- Occupancy meja turunan dari tb_pesanan.status='diproses'.
ALTER TABLE `tb_pesanan` ADD COLUMN `mejaId` INTEGER NULL;
ALTER TABLE `tb_pesanan` ADD CONSTRAINT `tb_pesanan_mejaId_fkey` FOREIGN KEY (`mejaId`) REFERENCES `tb_meja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE `tb_pesanan` p JOIN `tb_meja` m ON m.`nama` = p.`meja` SET p.`mejaId` = m.`id` WHERE p.`meja` IS NOT NULL;
ALTER TABLE `tb_pesanan` DROP COLUMN `meja`;
CREATE INDEX `tb_pesanan_mejaId_idx` ON `tb_pesanan`(`mejaId`);
