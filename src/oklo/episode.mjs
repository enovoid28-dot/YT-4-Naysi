export const EPISODE={
 title:'Reaktor Nuklir Berusia 2 Miliar Tahun Ini Bukan Buatan Manusia',
 width:1440,height:2560,fps:90,
 // IAEA (10 Aug 2018), natural isotope deficit and geological mechanism.
 // Meshik et al., PRL 93,182302 (2004), doi:10.1103/PhysRevLett.93.182302:
 // xenon-derived 30-minute/2.5-hour operating mode, not a directly observed clock.
 sources:['https://www.iaea.org/newscenter/news/meet-oklo-the-earths-two-billion-year-old-only-known-natural-nuclear-reactor','https://www.osti.gov/etdeweb/biblio/20619276'],
 scenes:[
 ['SEBELUM MANUSIA','Jauh sebelum manusia ada, Bumi sudah punya reaktor nuklir. Bukan mesin peninggalan peradaban hilang, melainkan batuan yang menjalankan reaksi berantai sendiri. Jejaknya ditemukan di Oklo, Gabon, Afrika, dan usianya sekitar dua miliar tahun.'],
 ['KEJANGGALAN 1972','Misterinya terungkap pada tahun seribu sembilan ratus tujuh puluh dua. Peneliti memeriksa uranium dari tambang itu dan menemukan sesuatu yang janggal. Sebagian uranium yang biasanya tersedia di alam, ternyata sudah berkurang. Seolah pernah dipakai.'],
 ['SIDIK JARI ATOM','Yang berkurang adalah uranium dua ratus tiga puluh lima. Jenis atom ini dapat mempertahankan reaksi fisi, yaitu pembelahan inti atom. Pemeriksaan lanjutan menemukan produk hasil pembelahan. Jadi, bukan sekadar salah ukur: batuannya menyimpan jejak reaktor.'],
 ['BAHAN BAKAR PURBA','Tapi bagaimana batu bisa menjadi reaktor? Dua miliar tahun lalu, bagian uranium jenis itu di alam masih sekitar tiga persen. Sekarang tinggal sekitar nol koma tujuh persen. Jumlahnya menyusut karena peluruhan radioaktif sepanjang waktu.'],
 ['KONDISI YANG PAS','Di Oklo, uranium terkumpul dalam endapan yang cukup pekat. Bentuk dan ukuran batuannya juga mendukung reaksi berantai. Tetapi bahan bakar saja belum cukup. Ada komponen lain yang membuat sistem ini bisa bekerja: air tanah.'],
 ['AIR MEMPERLAMBAT','Saat sebuah inti terbelah, energi dan neutron dilepaskan. Air memperlambat neutron, sehingga lebih mudah memicu pembelahan inti berikutnya. Satu pembelahan memicu pembelahan lain. Dalam kondisi yang tepat, rangkaian ini bisa bertahan tanpa mesin buatan manusia.'],
 ['REM ALAMI','Yang mengejutkan, sistemnya bisa mengerem sendiri. Reaksi memanaskan batu dan air. Ketika air mendidih dan berkurang, neutron tidak lagi diperlambat dengan cukup baik. Reaksi pun mereda. Setelah batu mendingin, air masuk kembali, dan siklus berulang.'],
 ['JAM DI DALAM BATU','Dari pola isotop gas xenon yang terperangkap dalam mineral, peneliti merekonstruksi salah satu pola kerjanya. Sekitar tiga puluh menit aktif, lalu dua setengah jam beristirahat. Bukan jam yang ditemukan di tambang, tetapi waktu yang dibaca dari atom.'],
 ['BUKAN PEMBANGKIT','Jadi ini bukan pembangkit listrik purba. Tidak ada turbin, kabel, atau kota yang diterangi. Yang ditemukan adalah bekas reaksi nuklir alami dalam batuan. Bahan bakar, air, dan kondisi geologi kebetulan bertemu pada tempat serta zaman yang tepat.'],
 ['ARSIP DUA MILIAR TAHUN','Kini reaktor alaminya sudah lama berhenti. Namun batuannya menyimpan bukti bahwa alam melakukan fisi jauh sebelum manusia memahaminya. Oklo mengubah pertanyaan kita: bukan siapa yang membangunnya, melainkan kondisi apa yang membuatnya mungkin. Kamu baru tahu tentang Oklo?'],
 ].map(([label,text],index)=>({id:`s${index+1}`,index,label,text}))
};
