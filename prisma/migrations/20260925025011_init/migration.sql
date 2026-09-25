-- CreateTable
CREATE TABLE `tb_user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL,
    `image` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `role` ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_user_email_key`(`email`),
    UNIQUE INDEX `tb_user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tb_session_token_key`(`token`),
    INDEX `tb_session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tb_account_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `tb_verification_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKategori` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `tb_kategori_namaKategori_key`(`namaKategori`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaProduk` VARCHAR(100) NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `kategoriId` INTEGER NOT NULL,

    INDEX `tb_produk_kategoriId_idx`(`kategoriId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pesanan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('diproses', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses',

    INDEX `tb_pesanan_userId_idx`(`userId`),
    INDEX `tb_pesanan_tanggal_idx`(`tanggal`),
    INDEX `tb_pesanan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_detail_pesanan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesananId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `tb_detail_pesanan_pesananId_idx`(`pesananId`),
    INDEX `tb_detail_pesanan_produkId_idx`(`produkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pembayaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesananId` INTEGER NOT NULL,
    `metode` ENUM('tunai', 'non_tunai') NOT NULL,
    `jumlahBayar` DECIMAL(10, 2) NOT NULL,
    `tanggal` DATE NOT NULL,
    `status` ENUM('lunas', 'belum_lunas') NOT NULL DEFAULT 'belum_lunas',

    UNIQUE INDEX `tb_pembayaran_pesananId_key`(`pesananId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_stok` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produkId` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `jenis` ENUM('masuk', 'keluar') NOT NULL,
    `tanggal` DATE NOT NULL,

    INDEX `tb_stok_produkId_idx`(`produkId`),
    INDEX `tb_stok_jenis_idx`(`jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_laporan_penjualan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periode` VARCHAR(20) NOT NULL,
    `totalPenjualan` DECIMAL(12, 2) NOT NULL DEFAULT 0,

    UNIQUE INDEX `tb_laporan_penjualan_periode_key`(`periode`),
    INDEX `tb_laporan_penjualan_periode_idx`(`periode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_session` ADD CONSTRAINT `tb_session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_account` ADD CONSTRAINT `tb_account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_produk` ADD CONSTRAINT `tb_produk_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `tb_kategori`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_pesanan` ADD CONSTRAINT `tb_pesanan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `tb_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_detail_pesanan` ADD CONSTRAINT `tb_detail_pesanan_pesananId_fkey` FOREIGN KEY (`pesananId`) REFERENCES `tb_pesanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_detail_pesanan` ADD CONSTRAINT `tb_detail_pesanan_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `tb_produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_pembayaran` ADD CONSTRAINT `tb_pembayaran_pesananId_fkey` FOREIGN KEY (`pesananId`) REFERENCES `tb_pesanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_stok` ADD CONSTRAINT `tb_stok_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `tb_produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
