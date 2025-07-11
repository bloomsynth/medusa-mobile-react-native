import 'dayjs/locale/id';
import type { FluentTemplate } from './type';

const id_ID: FluentTemplate = {
  home: 'Beranda',
  categories: 'Kategori',
  collections: 'Koleksi',
  profile: 'Profil',

  'top-selling': 'Penjualan Teratas',
  'see-all': 'Lihat Semua',
  'latest-products': 'Produk Terbaru',
  'trending-products': 'Produk Tren',
  'sign-in': 'Masuk',
  'sign-in-to-view-your-profile': 'Masuk untuk melihat profil dan pesanan Anda',
  'signing-in': 'Sedang masuk...',
  email: 'Email',
  'enter-your-email': 'Masukkan email Anda',
  password: 'Kata Sandi',
  'enter-your-password': 'Masukkan kata sandi Anda',
  'dont-have-an-account': 'Belum punya akun? Daftar',
  'invalid-credentials': 'Kredensial tidak valid. Silakan coba lagi.',
  'no-collections-found': 'Tidak ada koleksi yang ditemukan',
  cart: 'Keranjang',
  checkout: 'Pembayaran',
  'go-home': 'Kembali ke Beranda',
  'you-dont-have-anything-in-your-cart':
    'Anda tidak memiliki apa pun di keranjang Anda.\nGunakan tautan di bawah ini untuk mulai menjelajahi produk kami.',
  'profile-information': 'Informasi Profil',
  'order-with-id': 'Pesanan # { $id }',
  orders: 'Pesanan',
  'shipping-addresses': 'Alamat Pengiriman',
  logout: 'Keluar',
  'profile-details': 'Detail Profil',
  name: 'Nama',
  phone: 'Telepon',
  'edit-profile': 'Edit Profil',
  save: 'Simpan',
  cancel: 'Batal',
  'first-name': 'Nama Depan',
  'last-name': 'Nama Belakang',
  'no-orders-found': 'Tidak ada pesanan yang ditemukan',
  'sign-in-to-view-orders': 'Silakan masuk untuk melihat pesanan Anda',
  view: 'Lihat',
  'remaining-items': '{ $count } lagi',
  'no-categories-found': 'Tidak ada kategori yang ditemukan',
  variant: 'Varian',
  'add-a-promo-code': 'Tambahkan Kode Promo',
  'enter-promo-code': 'Masukkan kode promo',
  'applied-promotions': 'Promosi yang Diterapkan',
  'invalid-promo-code': 'Kode promo tidak valid',
  'failed-to-apply-promotion': 'Gagal menerapkan kode promo',
  'failed-to-remove-promotion': 'Gagal menghapus kode promo',
  apply: 'Terapkan',
  summary: 'Ringkasan',
  discount: 'Diskon',
  subtotal: 'Subtotal',
  shipping: 'Pengiriman',
  taxes: 'Pajak',
  total: 'Total',
  'use-same-address-for-billing': 'Gunakan alamat yang sama untuk penagihan',
  'shipping-address': 'Alamat Pengiriman',
  'billing-address': 'Alamat Penagihan',
  address: 'Alamat',
  company: 'Perusahaan',
  optional: 'Opsional',
  'postal-code': 'Kode Pos',
  city: 'Kota',
  'province-or-state': 'Provinsi',
  country: 'Negara',
  'select-a-country': 'Pilih negara',
  delivery: 'Pengiriman',
  payment: 'Pembayaran',
  review: 'Tinjauan',
  'continue-to-delivery': 'Lanjutkan ke Pengiriman',
  'continue-to-payment': 'Lanjutkan ke Pembayaran',
  'review-order': 'Tinjau Pesanan',
  'pay-using-provider': 'Bayar menggunakan { $provider }',
  'place-order': 'Lakukan Pemesanan',
  continue: 'Lanjutkan',
  'please-select-a-payment-method': 'Silakan pilih penyedia pembayaran',
  'no-cart-found': 'Keranjang tidak ditemukan',
  'payment-provider-not-supported': 'Penyedia pembayaran tidak didukung',
  'failed-to-complete-order': 'Gagal menyelesaikan pesanan',
  error: 'Kesalahan',
  'an-error-occurred': 'Terjadi kesalahan',
  'no-cart-id': 'ID Keranjang tidak ada',
  'failed-to-update-shipping-method': 'Gagal memperbarui metode pengiriman',
  'loading-shipping-options': 'Memuat opsi pengiriman',
  'select-shipping-method': 'Pilih Metode Pengiriman',
  calculating: 'Menghitung',
  'no-region-id': 'ID wilayah tidak ada',
  'stripe-payment-coming-soon': 'Antarmuka pembayaran Stripe segera hadir!',
  'no-additional-actions-required-for-manual-payment':
    'Tidak ada tindakan tambahan yang diperlukan untuk pembayaran manual.',
  'payment-provider-is-in-development':
    'Penyedia pembayaran { $provider } sedang dalam pengembangan.',
  'loading-payment-options': 'Memuat opsi pembayaran',
  'select-payment-method': 'Pilih Metode Pembayaran',
  qty: 'Jml',
  'shipping-method': 'Metode Pengiriman',
  'payment-method': 'Metode Pembayaran',
  'no-shipping-method-selected': 'Tidak ada metode pengiriman yang dipilih',
  'no-payment-method-selected': 'Tidak ada metode pembayaran yang dipilih',
  canceled: 'Dibatalkan',
  'not-fulfilled': 'Belum Dipenuhi',
  'partially-fulfilled': 'Sebagian Dipenuhi',
  fulfilled: 'Dipenuhi',
  'partially-shipped': 'Sebagian Dikirim',
  shipped: 'Dikirim',
  'partially-delivered': 'Sebagian Diterima',
  delivered: 'Diterima',
  'count-items': '{ $count } item',
  'order-details': 'Detail Pesanan',
  'order-not-found': 'Pesanan tidak ditemukan',
  'placed-on': 'Dipesan pada { $datetime }',
  status: 'Status',
  'order-items': 'Item Pesanan',
  contact: 'Kontak',
  method: 'Metode',
  'order-summary': 'Ringkasan Pesanan',
  'continue-shopping': 'Lanjutkan Belanja',
  addresses: 'Alamat',
  'please-sign-in-to-view-your-address':
    'Silakan masuk untuk melihat alamat Anda',
  'no-addresses-found': 'Tidak ada alamat yang ditemukan',
  'add-new-address': 'Tambahkan Alamat Baru',
  'add-address': 'Tambahkan Alamat',
  'edit-address': 'Edit Alamat',
  'save-changes': 'Simpan Perubahan',
  'country-code': 'Kode Negara',
  'product-information': 'Informasi Produk',
  material: 'Bahan',
  'country-of-origin': 'Negara Asal',
  type: 'Tipe',
  weight: 'Berat',
  dimensions: 'Dimensi',
  'days-return': 'Pengembalian dalam { $count } hari',
  'fast-delivery': 'Pengiriman Cepat',
  'add-to-cart': 'Tambahkan ke keranjang',
  'out-of-stock': 'Stok habis',
  'view-cart': 'Lihat keranjang',
  settings: 'Pengaturan',
  language: 'Bahasa',
  'select-language': 'Pilih bahasa',
  'language-is-required': 'Bahasa wajib diisi',
  'first-name-is-required': 'Nama depan wajib diisi',
  'last-name-is-required': 'Nama belakang wajib diisi',
  'address-is-required': 'Alamat wajib diisi',
  'postal-code-is-required': 'Kode pos wajib diisi',
  'city-is-required': 'Kota wajib diisi',
  'country-is-required': 'Negara wajib diisi',
  'phone-is-required': 'Nomor telepon wajib diisi',
  'please-enter-a-valid-email': 'Silakan masukkan email yang valid',
  'invalid-email-address': 'Alamat email tidak valid',
  'password-must-be-at-least-n-characters':
    'Kata sandi harus terdiri dari setidaknya { $n } karakter',
  register: 'Daftar',
  'enter-your-first-name': 'Masukkan nama depan Anda',
  'enter-your-last-name': 'Masukkan nama belakang Anda',
  'create-account': 'Buat Akun',
  'creating-account': 'Sedang membuat akun',
  'already-have-an-account': 'Sudah memiliki akun? Masuk',
  'registration-failed': 'Pendaftaran gagal. Silakan coba lagi.',
};

export default Object.keys(id_ID)
  .map(key => `${key} = ${(id_ID as any)[key]}`)
  .join('\n');
