# Component DNA — Kerah Kemeja Bulat

> Blueprint resmi (official reference) telah dianalisis pada sprint ini dan menjadi satu-satunya sumber kebenaran visual untuk kelima seksi di bawah. `sourceImage = OFFICIAL_REFERENCE_PENDING` hanya berarti referensi penyimpanan (storage asset) untuk blueprint ini belum dibuat — bukan berarti analisis di bawah ini bersifat generik. Saat storage asset dibuat, hanya `ai_dna.metadata.sourceImage` yang diperbarui.

## 1. Metadata

- id: `kerah-kemeja-bulat`
- category: `kerah`
- name: `Kerah Kemeja Bulat`
- version: `1`

## 2. Geometry

- Bentuk keseluruhan: satu unit kerah rebah terdiri dari collar stand (band) dan daun kerah (leaf) yang lebih lebar, melengkung keluar dari neckline dan menyempit menjadi dua ujung depan.
- Simetri: simetris bilateral terhadap sumbu vertikal tengah-depan; panel kiri dan kanan daun kerah saling mencerminkan pada garis luarnya.
- Collar stand: terlihat sebagai pita yang lebih sempit di sepanjang tepi yang berdekatan dengan neckline, berbeda dari bagian daun kerah yang lebih lebar di luarnya.
- Collar spread: kedua ujung depan daun kerah bertemu dan sedikit saling tumpang tindih (overlap) di tengah-depan, menyisakan celah segitiga kecil tepat di bawah titik pertemuan.
- Tip shape: setiap ujung depan berakhir dalam kurva membulat menerus — tepi luar melengkung turun dan membelok ke tepi tengah-depan tanpa membentuk sudut tajam.
- Tip radius: lengkungan pada tiap ujung berupa busur halus dan menerus (tidak terlihat vertex bersudut dari dua garis lurus yang bertemu).
- Opening angle: tepi neckline membentuk satu busur terbuka menerus, terbentang dari satu ujung depan, melingkar ke belakang, hingga ke ujung depan lainnya.
- Curvature: tepi luar (daun kerah) melengkung menerus dari belakang leher turun menuju tiap ujung depan, dengan lengkungan yang semakin menyempit mendekati ujung.
- Proporsi: daun kerah terentang pada jarak yang jelas lebih jauh dari tepi neckline dibandingkan lebar pita stand itu sendiri — daun kerah secara proporsional lebih lebar/panjang dibandingkan tinggi stand.

## 3. Construction

- Stiffness: kerah mempertahankan bentuk lengkungnya tanpa penyangga dari luar, menunjukkan adanya lapisan penguat internal.
- Thickness: konstruksi berlapis — kain permukaan luar dan kain lapisan dalam (interior-facing) yang berbeda tekstur/tonasinya terlihat di tepi neckline dan di sepanjang bagian dalam lengkungan.
- Folded edge: tepi keliling luar daun kerah adalah tepi lipat yang tertutup rapi (tidak ada tepi mentah/belum selesai yang terlihat di sepanjang lengkung luar maupun di kedua ujung).
- Seam visibility: garis topstitch terlihat berjalan sejajar dengan tepi lipat luar, menerus di sepanjang keliling daun kerah termasuk mengelilingi kedua ujung.
- Transition: terdapat garis jahitan/lipatan horizontal yang memisahkan bagian stand dari bagian daun kerah.
- Center front join: kedua panel daun kerah bertemu dan sedikit tumpang tindih di tengah-depan, dengan jahitan/lipatan vertikal terlihat pada titik tumpang tindih tersebut.
- Interfacing: kemampuan kerah mempertahankan bentuk lengkung tanpa penyangga menunjukkan adanya lapisan penguat internal (interfacing) di dalam bagian stand maupun daun kerah.

## 4. Anchor Point

- Neckline: tepi busur terbuka yang panjang (berlawanan dengan kedua ujung depan) adalah tepi penyambung yang menyatu dengan jahitan neckline garmen.
- Center placket: kedua ujung depan bertemu pada titik yang berkorespondensi dengan bukaan plaket tengah-depan garmen.
- Shoulder transition: tepi penyambung neckline berjalan menerus dari satu ujung depan, melewati posisi yang berkorespondensi dengan jahitan bahu, menuju tengah-belakang, dan berlanjut ke ujung depan lainnya.
- Symmetry axis: garis vertikal yang melewati titik pertemuan tengah-depan dan titik tengah busur neckline di tengah-belakang.

## 5. Constraint

- Kedua ujung depan harus tetap membulat — tidak boleh diubah menjadi sudut lancip atau bersudut tajam.
- Panel daun kerah kiri dan kanan harus tetap saling mencerminkan (mirror-symmetric) terhadap sumbu tengah-depan.
- Proporsi stand-terhadap-daun-kerah (daun kerah lebih lebar/panjang dari stand) tidak boleh berubah.
- Derajat tumpang tindih (overlap) antara kedua ujung depan di tengah-depan harus dipertahankan seperti pada referensi.
- Bentuk busur tunggal yang menerus pada tepi neckline tidak boleh terputus atau tersegmentasi.
