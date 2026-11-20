export const EPISODE = {
  title: 'Kenapa Besi Terasa Lebih Dingin dari Kayu, Padahal Suhunya Sama?',
  width: 1440, height: 2560, fps: 90,
  source: 'https://web.ics.purdue.edu/~dchavas/teaching/interactive/heat-transfer.html',
  scenes: [
    ['SUHU SAMA.','RASA BERBEDA.', 'Besi dan kayu ini suhunya sama. Tapi saat disentuh, kenapa besi terasa lebih dingin?', ['lebih dingin?'], 'PERTANYAAN'],
    ['BUKAN DINGIN','YANG BERPINDAH.', 'Bukan karena besi menyimpan dingin. Kuncinya ada pada seberapa cepat panas berpindah dari kulitmu.', ['panas','berpindah'], 'KUNCI JAWABAN'],
    ['SATU RUANGAN.','DUA BAHAN.', 'Bayangkan keduanya sudah lama berada di ruangan bersuhu dua puluh lima derajat, tanpa sumber panas lain.', ['dua puluh lima derajat,'], 'KESETIMBANGAN'],
    ['DARI HANGAT','KE LEBIH DINGIN.', 'Tanganmu lebih hangat. Jadi saat menyentuh keduanya, panas mengalir dari tangan ke benda, bukan sebaliknya.', ['dari tangan ke benda,'], 'ARAH ALIRAN'],
    ['BESI: PANAS','CEPAT MENYEBAR.', 'Besi menghantarkan panas dengan baik. Panas dari kulit cepat menyebar ke bagian besi yang lain.', ['cepat menyebar'], 'KONDUKTOR'],
    ['KAYU: PANAS','TERTAHAN LOKAL.', 'Kayu menghantarkan panas jauh lebih lambat. Bagian yang menyentuh tangan cepat menghangat, sehingga perpindahan panas melambat.', ['jauh lebih lambat.'], 'PENGHANTAR BURUK'],
    ['KULITMU','YANG MENDINGIN.', 'Sarafmu merespons suhu kulit dan perubahannya. Kulit yang lebih cepat mendingin membuat besi terasa lebih dingin.', ['suhu kulit','perubahannya.'], 'RESPONS SARAF'],
    ['LEBIH DARI','DAYA HANTAR.', 'Penjelasan lengkapnya memakai efusivitas termal: gabungan daya hantar panas, massa jenis, dan kapasitas panas bahan.', ['efusivitas termal:'], 'EFUSIVITAS'],
    ['SAAT LEBIH PANAS,','ARAHNYA BERBALIK.', 'Kalau bendanya lebih panas dari kulit, arahnya berbalik. Logam justru terasa lebih panas. Jangan mengujinya dengan benda panas.', ['lebih panas.','Jangan mengujinya'], 'PEMBALIKAN'],
    ['SUHU SAMA.','LAJU BERBEDA.', 'Jadi, sensasi dingin bukan bukti suhunya lebih rendah. Suhu bisa sama, tetapi laju perpindahan panasnya berbeda.', ['laju perpindahan panasnya berbeda.'], 'INTINYA'],
  ].map(([a,b,text,accent,label],i)=>({id:`s${i+1}`,a,b,text,accent,label,index:i})),
};
