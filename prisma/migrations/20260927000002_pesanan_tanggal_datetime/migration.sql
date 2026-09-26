-- Ubah tb_pesanan.tanggal DATE menjadi DATETIME agar kartu pesanan bisa tampil tanggal dan jam.
ALTER TABLE `tb_pesanan` MODIFY `tanggal` DATETIME(3) NOT NULL;
