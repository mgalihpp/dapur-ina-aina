-- Enforce BR-2 at DB level: stok tidak boleh negatif.
ALTER TABLE `tb_produk` ADD CONSTRAINT `tb_produk_stok_nonnegatif` CHECK (`stok` >= 0);
