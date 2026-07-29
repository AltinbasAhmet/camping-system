"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "tr" | "en";

const translations: Record<string, string> = {
  "Kullanıcı": "User",
  "Kamp Sahibi": "Camp Owner",
  "Sistem Yöneticisi": "System Administrator",
  "Personel": "Staff",
  "Rezervasyonlarım": "My Reservations",
  "Biletlerim": "My Tickets",
  "Etkinliklerim": "My Events",
  "Panelim": "My Dashboard",
  "Kamp Yerlerim": "My Campsites",
  "Rezervasyonlar": "Reservations",
  "Etkinlikler": "Events",
  "Panel": "Dashboard",
  "Kullanıcılar": "Users",
  "Kamplar": "Campsites",
  "Personel Paneli": "Staff Dashboard",
  "Check-in / Check-out": "Check-in / Check-out",
  "Çıkış": "Log out",
  "Kamp Alanları": "Campsites",
  "Nasıl Çalışır?": "How It Works",
  "Hakkımızda": "About Us",
  "Giriş Yap": "Log In",
  "Kayıt Ol": "Sign Up",
  "Giriş yap": "Log in",
  "Kayıt ol": "Sign up",
  "Ana sayfaya dön": "Back to homepage",
  "Şifremi unuttum": "Forgot password",
  "Şifre": "Password",
  "E-posta veya telefon ile giriş yapabilirsin.": "You can log in with your email address or phone number.",
  "Doğrulama kodu nereye gelsin?": "Where should we send the verification code?",
  "Giriş yapılıyor...": "Logging in...",
  "Hesabın yok mu?": "Don't have an account?",
  "CampPal hesabını oluştur. Kampçı olarak rezervasyon yapabilir veya kamp alanı sahibi olarak panele geçebilirsin.": "Create your CampPal account. Make reservations as a camper or manage your campsite as an owner.",
  "Kampçı / Kullanıcı": "Camper / User",
  "Kamp alanı sahibi": "Campsite owner",
  "Kamp arar, rezervasyon yapar ve etkinlik bileti alır.": "Searches campsites, makes reservations and buys event tickets.",
  "Kendi kamp alanını ve etkinliklerini yönetir.": "Manages their own campsite and events.",
  "Hesap türü": "Account type",
  "Kamp alanı bilgileri": "Campsite information",
  "Kamp adı": "Campsite name",
  "Şehir": "City",
  "İlçe": "District",
  "Çadır kapasitesi": "Tent capacity",
  "Hesap oluşturuluyor...": "Creating account...",
  "Zaten hesabın var mı?": "Already have an account?",
  "Kamp oluştur": "Create campsite",
  "Kampı ekle": "Add campsite",
  "Oluşturuluyor...": "Creating...",
  "Açıklama": "Description",
  "Fotoğraf ekle": "Add photo",
  "Kapak fotoğrafı": "Cover photo",
  "Fotoğrafı yükle": "Upload photo",
  "Yükleniyor...": "Loading...",
  "Düzenle": "Edit",
  "Kaydet": "Save",
  "Kaydediliyor...": "Saving...",
  "Vazgeç": "Cancel",
  "Sil": "Delete",
  "Siliniyor...": "Deleting...",
  "Kamp yerini sil": "Delete campsite",
  "Yeni kamp alanı ekle": "Add a new campsite",
  "Kamp etkinliği oluştur": "Create campsite event",
  "Kendi kampında bir etkinlik oluştur.": "Create an event at your own campsite.",
  "Etkinlik oluştur": "Create event",
  "Etkinlik başlığı": "Event title",
  "Bir kamp alanı seç": "Select a campsite",
  "Kapasite (kişi)": "Capacity (people)",
  "Bilet fiyatı (0 = ücretsiz)": "Ticket price (0 = free)",
  "Tüm kamplar": "All campsites",
  "Tüm durumlar": "All statuses",
  "Tüm atanmış kamplar": "All assigned campsites",
  "Ara": "Search",
  "Temizle": "Clear",
  "İşlem": "Action",
  "İletişim": "Contact",
  "Doğrulama": "Verification",
  "Onayla": "Approve",
  "Reddet": "Reject",
  "Onaylı": "Approved",
  "Bekliyor": "Pending",
  "Geldi olarak işaretle": "Mark as arrived",
  "Çıktı olarak işaretle": "Mark as departed",
  "Gişe işlemleri": "Gate operations",
  "Gişe giriş ve çıkış işlemi": "Gate check-in and check-out",
  "Rezervasyon kodu, plaka, rezervasyon sahibi veya misafir adını yazın.": "Enter a reservation code, license plate, reservation owner or guest name.",
  "Görev alanım": "My assignments",
  "Atanmış kamp": "Assigned campsite",
  "Girişi bekleyen": "Awaiting arrival",
  "Kampta bulunan": "Currently at campsite",
  "Rezervasyonları gör": "View reservations",
  "Geldi / Çıktı işlemleri": "Arrival / departure operations",
  "Duş": "Shower",
  "Sıcak su": "Hot water",
  "Kişi sayısı": "Number of guests",
  "Ücretsiz": "Free",
  "Bilet al": "Get ticket",
  "Rezervasyon yap": "Make reservation",
  "Doğrulama kodu gerekli": "Verification code required",
  "Kodu doğrula": "Verify code",
  "Doğrulanıyor...": "Verifying...",
  "Kodu tekrar gönder": "Resend code",
  "Gönderiliyor...": "Sending...",
  "Yeni kod gönderildi": "A new code has been sent",
  "Dil": "Language",
  "Türkçe": "Turkish",
  "İngilizce": "English",

  "Kamp Alanı": "Campsite",
  "Mutlu Kampçı": "Happy Campers",
  "Kamp yapmayı sevenler için her şey burada!": "Everything camping lovers need is here!",
  "Kamp alanlarını keşfet,": "Discover campsites,",
  "etkinliklere katıl,": "join events,",
  "doğayla bağ kur.": "connect with nature.",
  "CampPal ile kamp alanlarını kolayca keşfedebilir, yerinizi rezerve edebilir, etkinliklere katılabilir veya alanınızı diğer kampseverlerle paylaşabilirsiniz. Doğa tutkunları için tek adres.": "With CampPal, you can easily discover campsites, reserve your spot, join events, or share your campsite with other camping enthusiasts. One destination for nature lovers.",
  "Kamp Yerlerini Keşfet": "Discover Campsites",
  "Etkinlikleri Gör": "View Events",
  "CampPal ile Neler Yapabilirsiniz?": "What Can You Do with CampPal?",
  "Kamp Alanlarını Keşfet": "Discover Campsites",
  "Harita üzerinden size en uygun kamp alanlarını bulun, detaylarına göz atın ve yerinizi ayırtın.": "Find the most suitable campsites on the map, review their details, and reserve your spot.",
  "Rezervasyon Yap": "Make a Reservation",
  "İstediğiniz tarihleri seçin, plaka ve misafir bilgileriyle rezervasyonunuzu kolayca tamamlayın.": "Choose your dates and easily complete your reservation with vehicle and guest information.",
  "Etkinliklere Katıl": "Join Events",
  "Kamp alanlarında düzenlenen etkinlikleri inceleyin, filtreleyin ve size uygun etkinliklere katılın.": "Browse and filter events held at campsites and join the ones that suit you.",
  "Kamp Sahibi Paneli": "Camp Owner Dashboard",
  "Alanınızı yönetin, takvimlerinizi düzenleyin, rezervasyonları ve misafirlerinizi takip edin.": "Manage your campsite, organize calendars, and track reservations and guests.",
  "Kolay Check-in": "Easy Check-in",
  "Plaka bilgisiyle hızlı giriş yapın, kamp deneyiminize zaman kaybetmeden başlayın.": "Check in quickly with your license plate and start your camping experience without delay.",
  "Güvenli Rezervasyon": "Secure Reservation",
  "Onaylı kamp alanları": "Verified campsites",
  "7/24 Destek": "24/7 Support",
  "Her zaman yanınızdayız": "We are always here for you",
  "Topluluk": "Community",
  "Büyük bir kamp ailesi": "A large camping family",
  "Doğaya Saygı": "Respect for Nature",
  "Sürdürülebilir kampçılık": "Sustainable camping",
  "1. Adım": "Step 1",
  "2. Adım": "Step 2",
  "3. Adım": "Step 3",
  "Kamp alanını veya etkinliği bul": "Find a campsite or event",
  "Şehir, kamp adı veya etkinlik bilgisine göre arama yapıp uygun seçenekleri filtreleyebilirsin.": "Search by city, campsite name, or event information and filter suitable options.",
  "Rezervasyonunu tamamla": "Complete your reservation",
  "Tarih ve kişi bilgilerini girerek rezervasyonunu veya etkinlik biletini oluşturabilirsin.": "Enter date and guest details to create a reservation or event ticket.",
  "Kampa giriş yap": "Check in to the campsite",
  "Rezervasyon kodun veya plakan ile personel tarafından hızlıca giriş işlemi yapılır.": "Staff can quickly check you in using your reservation code or license plate.",
  "Kamp adı veya açıklama": "Campsite name or description",
  "Etkinlik veya kamp adı": "Event or campsite name",
  "Gecelik fiyat": "Price per night",
  "Karavan kapasitesi": "Caravan capacity",
  "Toplam kapasite": "Total capacity",
  "Adres": "Address",
  "Telefon": "Phone",
  "Elektrik": "Electricity",
  "Evcil hayvan dostu": "Pet friendly",
  "Aktif rezervasyonlar": "Active reservations",
  "Toplam rezervasyon": "Total reservations",
  "Toplam kullanıcı": "Total users",
  "Toplam kamp": "Total campsites",
  "Toplam bilet": "Total tickets",
  "Yeni şifre": "New password",
  "Doğrulama kodu": "Verification code",
  "E-posta (opsiyonel)": "Email (optional)",
  "E-posta (veya telefon)": "Email (or phone)",
  "Telefon (veya e-posta)": "Phone (or email)",
  "E-posta veya telefon": "Email or phone",
  "Ad soyad": "Full name",
  "T.C. no opsiyonel": "National ID (optional)",
  "Kapasite": "Capacity",
  "Etkinlik": "Event",
  "Check-in": "Check-in",
  "Check-out": "Check-out",
  "Giriş saati": "Check-in time",
  "Çıkış saati": "Check-out time",
  "Opsiyonel": "Optional",
  "Henüz kamp eklenmemiş.": "No campsite has been added yet.",
  "Henüz etkinlik bulunmuyor.": "No events found yet.",
  "Henüz rezervasyon bulunmuyor.": "No reservations found yet.",
  "Rezervasyon bulunamadı": "Reservation not found",
  "Kamp alanları yüklenemedi": "Campsites could not be loaded",
  "Etkinlikler yüklenemedi": "Events could not be loaded",
  "Rezervasyonlar yüklenemedi": "Reservations could not be loaded",
  "Bilgiler alınamadı": "Information could not be retrieved",
  "Panel verileri yüklenemedi": "Dashboard data could not be loaded",
  "Kamp detayı yüklenemedi": "Campsite details could not be loaded",
  "Bu kampı silmek istediğinize emin misiniz?": "Are you sure you want to delete this campsite?",
  "Bu etkinliği silmek istediğinize emin misiniz?": "Are you sure you want to delete this event?",
  "Bu yorumu silmek istediğinize emin misiniz?": "Are you sure you want to delete this review?",
  "Bu kullanıcıyı silmek istediğinize emin misiniz?": "Are you sure you want to delete this user?",
  "Kamp silindi.": "Campsite deleted.",
  "Etkinlik silindi.": "Event deleted.",
  "Yorum silindi.": "Review deleted.",
  "Fotoğraf eklendi.": "Photo added.",
  "Kamp bilgileri güncellendi.": "Campsite information updated.",
  "Rezervasyon onaylandı.": "Reservation approved.",
  "Rezervasyon reddedildi.": "Reservation rejected.",
  "Rezervasyon durumu güncellendi.": "Reservation status updated.",
  "Etkinlik güncellendi.": "Event updated.",
  "Yorumunuz eklendi.": "Your review has been added.",
  "Kamp sahibi onaylandı.": "Camp owner approved.",
  "Kamp sahibi başvurusu reddedildi.": "Camp owner application rejected.",
  "Personel kampa atandı.": "Staff assigned to campsite.",
  "Personel kamp ataması kaldırıldı.": "Staff campsite assignment removed.",
  "Kullanıcı silindi.": "User deleted.",
  "Rol güncellendi.": "Role updated.",
  "Misafir geldi olarak işaretlendi.": "Guest marked as arrived.",
  "Misafir çıktı olarak işaretlendi.": "Guest marked as departed.",
  "Personel misafirin geldiğini onayladı.": "Staff confirmed the guest's arrival.",
  "Personel misafirin çıktığını onayladı.": "Staff confirmed the guest's departure.",
  "Kamp yorumları": "Campsite reviews",
  "Yorum ekle": "Add review",
  "Puan": "Rating",
  "Yorumu gönder": "Submit review",
  "Yorum gönderiliyor...": "Submitting...",
  "Henüz yorum yapılmamış. İlk yorumu siz ekleyin.": "No reviews yet. Be the first to add one.",
  "Yorum yapmak için giriş yapın.": "Log in to leave a review.",
  "Kamp hakkındaki deneyiminizi paylaşın...": "Share your experience about this campsite...",
  "Panel yüklenemedi": "Dashboard could not be loaded",
  "Kamp sahibi paneli": "Camp owner dashboard",
  "Etkinlik misafirleri": "Event guests",
  "Plaka ile giriş işlemi": "License plate check-in",
  "Henüz eklenmiş kamp yeriniz yok.": "You have not added a campsite yet.",
  "Herkese açık detay": "Public details",
  "Kamp bilgilerini düzenle": "Edit campsite information",
  "Giriş saati (opsiyonel)": "Check-in time (optional)",
  "Çıkış saati (opsiyonel)": "Check-out time (optional)",
  "Yorum en az 3 karakter olmalıdır.": "The review must be at least 3 characters.",
  "Yorum eklenemedi": "Review could not be added",
  "Yorum silinemedi": "Review could not be deleted",
  "Etkinlik bileti alındı.": "Event ticket purchased.",
  "Etkinlik bileti alınamadı": "Event ticket could not be purchased",
  "Kamp etkinlikleri": "Campsite events",
  "Bu kamp için etkinlik yok.": "There are no events for this campsite.",
  "Mükemmel": "Excellent",
  "Çok iyi": "Very good",
  "İyi": "Good",
  "Orta": "Average",
  "Kötü": "Poor",
  "Rezervasyon oluştur": "Create reservation",
  "Rezervasyon oluşturuldu": "Reservation created",
  "Çadır": "Tent",
  "Plaka örn. 01ABC123": "License plate e.g. 01ABC123",
  "misafir adı": "guest name",
  "Etkinlik Biletleri": "Event Tickets",
  "Etkinlik bileti yok.": "There are no event tickets.",
  "İletişim bilgisi yok": "No contact information",
  "Etkinlik biletleri yüklenemedi": "Event tickets could not be loaded",
  "Yeni etkinlik oluştur": "Create new event",
  'Kendi kampında oluşturduğun etkinlikleri buradan yönetebilirsin. Not: kampçıların senin kampında açtığı etkinlikler kendi "Etkinliklerim" alanlarında görünür, buradan sadece kendi oluşturdukların listelenir.': "Manage the events you created at your campsite here. Events created by campers appear in their own My Events area; only events you created are listed here.",
  "bilet satıldı": "tickets sold",
  "Bilet fiyatı": "Ticket price",
  "Henüz oluşturduğun bir etkinlik yok.": "You have not created an event yet.",
  "Etkinlik güncellenemedi": "Event could not be updated",
  "Etkinlik silinemedi (bileti satılmış etkinlikler silinemez)": "The event could not be deleted (events with sold tickets cannot be deleted)",
  "Kamp sahibi": "Camp owner",
  "Personel paneli": "Staff dashboard",
  "Yalnızca size atanmış kampları ve bu kampların rezervasyonlarını görebilirsiniz.": "You can only view campsites assigned to you and their reservations.",
  "Henüz bir kampa atanmadınız. Sistem yöneticisi atama yaptıktan sonra burada görünecek.": "You have not been assigned to a campsite yet. It will appear here after an administrator assigns you.",
  "toplam rezervasyon": "total reservations",
  "Etkinlik oluşturulamadı": "Event could not be created",
  "Kampçı olarak rezervasyon yapabilir veya kamp alanı sahibi olarak panele geçebilirsin.": "You can make reservations as a camper or use the owner dashboard as a campsite owner.",
  "Başvurunuz alındı": "Your application has been received",
  "Giriş sayfasına git": "Go to login page",
  "Sistem yöneticisi, hesabınızı onaylamadan önce buradaki bilgileri ve fotoğrafı inceleyecek.": "The system administrator will review this information and the photo before approving your account.",
  "Kamp alanınızı tanıtın": "Describe your campsite",
  "Kamp iletişim telefonu": "Campsite contact phone",
  "Geçici şifre (en az 6 karakter)": "Temporary password (at least 6 characters)",
  "Doğrulama tamamlandı. Kamp sahibi hesabınız ve kamp başvurunuz, sistem yöneticisi gönderdiğiniz bilgileri ve fotoğrafı inceledikten sonra onaylanacak.": "Verification is complete. Your campsite owner account and application will be approved after the system administrator reviews the information and photo you submitted.",
  "Hesabınız sistem yöneticisi onayını bekliyor. Onaylandığında giriş yapabileceksiniz.": "Your account is awaiting administrator approval. You will be able to log in after it is approved.",
  "E-posta ile kod almak için e-posta adresinizi girin.": "Enter your email address to receive the code by email.",
  "SMS ile kod almak için telefon numaranızı girin.": "Enter your phone number to receive the code by SMS.",
  "E-posta ile kod almak için e-posta adresinizle giriş yapın.": "Log in with your email address to receive the code by email.",
  "SMS ile kod almak için telefon numaranızla giriş yapın.": "Log in with your phone number to receive the code by SMS.",
  "Giriş yanıtı geçersiz": "Invalid login response",
  "Giriş yapılamadı": "Login failed",
  "Kayıt oluşturulamadı": "Account could not be created",
  "Kod doğrulanamadı": "Code could not be verified",
  "Kod tekrar gönderilemedi": "Code could not be resent",
  "Kod gönderilemedi": "Code could not be sent",
  "Telefonunuza SMS ile": "sent to your phone by SMS",
  "E-posta adresinize": "sent to your email address",
  "gönderilen 6 haneli kodu girin.": "enter the 6-digit code.",
  "Kamp oluşturulamadı": "Campsite could not be created",
  "Kamp güncellenemedi": "Campsite could not be updated",
  "Kamp silinemedi": "Campsite could not be deleted",
  "Fotoğraf eklenemedi": "Photo could not be added",
  "Kamp durumu güncellendi.": "Campsite status updated.",
  "Durum güncellenemedi": "Status could not be updated",
  "Kamplar yüklenemedi": "Campsites could not be loaded",
  "Kullanıcılar yüklenemedi": "Users could not be loaded",
  "Kullanıcı silinemedi": "User could not be deleted",
  "Rol güncellenemedi": "Role could not be updated",
  "Personel bilgileri alınamadı": "Staff information could not be retrieved",
  "Personel oluşturulamadı": "Staff account could not be created",
  "Personel hesabı oluşturuldu.": "Staff account created.",
  "Atama yapılamadı": "Assignment could not be completed",
  "Atama kaldırılamadı": "Assignment could not be removed",
  "Rezervasyonlar alınamadı": "Reservations could not be retrieved",
  "Rezervasyon güncellenemedi": "Reservation could not be updated",
  "İşlem tamamlanamadı": "The operation could not be completed",
  "Şifre yenilenemedi": "Password could not be reset",
  "İsim, e-posta veya telefon ara...": "Search by name, email, or phone...",
  "Dil seçimi": "Language selection",
  "CampPal kamp alanı": "CampPal campsite",
  "Bu etkinliği ve tüm biletlerini silmek istediğinize emin misiniz?": "Are you sure you want to delete this event and all of its tickets?",
  "Giriş:": "Check-in:",
  "Çıkış:": "Check-out:",
  "kişi": "people",
  "toplam": "total",
  "Kampınız kaydedildikten sonra sistem yöneticisi onayı bekleyecek (durum: beklemede). Onaylandıktan sonra herkese açık listede görünecek.": "After your campsite is saved, it will wait for administrator approval (status: pending). It will appear publicly after approval.",
  "Kampınız oluşturuldu": "Your campsite has been created",
  "Yayına alınmadan önce admin onayı bekleniyor.": "Administrator approval is required before publication.",
  "Bu rezervasyon henüz kamp sahibi tarafından onaylanmamış. Personel, yalnızca CONFIRMED durumundaki rezervasyonu “geldi” olarak işaretleyebilir.": "This reservation has not yet been approved by the campsite owner. Staff can only mark CONFIRMED reservations as arrived.",
  "Başvurulan kamp": "Applied campsite",
  "Kullanıcı bulunamadı.": "No users found.",
  "Girişe dön": "Back to login",
  "Kayıtlı iletişim bilginize tek kullanımlık kod gönderelim.": "We will send a one-time code to your registered contact information.",
  "Şifreyi yenile": "Reset password",
  "Kod gönder": "Send code",
  "Kamp alanlarını görüntüle": "View campsites",
  "Etkinlikleri görüntüle": "View events",
  "Bilet satın al": "Buy ticket",
  "Rezervasyon detayları": "Reservation details",
  "Misafir bilgileri": "Guest information",
  "Başlangıç tarihi": "Start date",
  "Bitiş tarihi": "End date",
  "Durum": "Status",
  "Fiyat": "Price",
  "Gece": "Night",
  "Gece sayısı": "Number of nights",
  "Toplam tutar": "Total amount",
  "Kamp sahibi tarafından onay bekleniyor": "Awaiting campsite owner approval",
  "İptal et": "Cancel",
  "Rezervasyonu iptal et": "Cancel reservation",
  "Rezervasyonu iptal etmek istediğinize emin misiniz?": "Are you sure you want to cancel the reservation?",
  "Henüz sonuç bulunamadı.": "No results found yet.",
  "Geri": "Back",
  "İleri": "Next",
  "Detayları gör": "View details",
  "Filtrele": "Filter",
  "Başlangıç": "Start",
  "Bitiş": "End",
  "Misafir": "Guest",
  "Kamp": "Campsite",
  "Bilet": "Ticket",
  "Satılan bilet": "Tickets sold",
  "Etkinlik tarihi": "Event date",
  "Başlangıç saati": "Start time",
  "Bitiş saati": "End time",
  "E-posta": "Email",
  "SMS": "SMS",
  "← Ana sayfaya dön": "← Back to homepage",
  "← Girişe dön": "← Back to login",
  "CampPal kampçıları ve kamp işletmelerini tek platformda buluşturur.": "CampPal brings campers and campsite businesses together on one platform.",
  "Amacımız kamp alanlarını keşfetmeyi, rezervasyon yapmayı, etkinliklere katılmayı ve kamp sahiplerinin alanlarını yönetmesini daha kolay hale getirmek. CampPal; kullanıcı, kamp sahibi ve yönetici deneyimini sade, güvenli ve anlaşılır bir akışta toplar.": "Our goal is to make discovering campsites, booking stays, joining events, and managing campsite operations easier. CampPal brings the user, campsite owner, and administrator experience together in a simple, secure, and clear flow.",
  "Tarih, kişi sayısı ve plaka bilgilerini girerek kamp yerini veya etkinlik biletini oluşturabilirsin.": "Enter the date, number of guests, and vehicle plate to create a campsite reservation or event ticket.",
  "Kampa hızlı giriş yap": "Check in quickly",
  "Kamp sahibi panelinden rezervasyon, misafir listesi ve check-in süreci kolayca takip edilir.": "Reservations, guest lists, and the check-in process can be easily tracked from the campsite owner dashboard.",
  "Load failed": "Connection failed. Please make sure the backend is running.",
  "Kamp etkinliklerini keşfet ve filtrele": "Discover and filter campsite events",
  "Kamp alanlarında düzenlenen etkinlikleri tarih, şehir ve arama kelimesine göre inceleyebilirsin. Etkinliğe katılmak için ilgili kamp detayına geçmen yeterli.": "Browse campsite events by date, city, and search term. Open the relevant campsite details to join an event.",
  "Tüm şehirler": "All cities",
  "Sıralama": "Sort",
  "Yaklaşan önce": "Soonest first",
  "En uzak tarih önce": "Latest first",
  "Etkinlikler yükleniyor...": "Loading events...",
  "Bu filtrelere uygun etkinlik bulunamadı": "No events match these filters",
  "Arama kelimesini veya şehir filtresini değiştirerek tekrar deneyebilirsin.": "Try changing the search term or city filter.",
  "Kamp alanlarını keşfet": "Discover campsites",
  "Şehir, anahtar kelime ve tesis özelliklerine göre aktif kamp alanlarını listeleyebilirsin.": "Browse active campsites by city, keyword, and facility features.",
  "Hiç aktif kamp alanı bulunamadı.": "No active campsites were found.",
  "Kamp Rezervasyonları": "Campsite Reservations",
  "Tüm Kamplar": "All Campsites",
  "Tüm Rezervasyonlar": "All Reservations",
  "Tüm Etkinlikler": "All Events",
  "Tümü": "All",
  "Kamp bulunamadı.": "No campsite found.",
  "Rezervasyon bulunamadı.": "No reservation found.",
  "Etkinlik bulunamadı.": "No event found.",
  "Etkinlik bileti bulunamadı.": "No event ticket found.",
  "Kamp detayına git": "Go to campsite details",
  "Personel yönetimi": "Staff management",
  "Personel hesabı oluştur": "Create staff account",
  "Personel hesabı oluşturun ve görev yapacağı kampı atayın.": "Create a staff account and assign the campsite where they will work.",
  "Henüz personel hesabı yok.": "There are no staff accounts yet.",
  "Henüz bir kampa atanmadı.": "Not assigned to a campsite yet.",
  "Kamp seç": "Select campsite",
  "Kaldır": "Remove",
  "Market": "Market",
  "Wi-Fi": "Wi-Fi",
  "Giriş saati:": "Check-in time:",
  "Çıkış saati:": "Check-out time:",
  "Çadır kapasitesi:": "Tent capacity:",
  "1 - Kötü": "1 - Poor",
  "3 - İyi": "3 - Good",
  "4 - Çok iyi": "4 - Very good",
  "5 - Mükemmel": "5 - Excellent",

  "${index + 1}. misafir adı": "Guest ${index + 1} name",
  '${notificationChannel === "SMS" ? "Telefonunuza SMS ile" : "E-posta adresinize"} gönderilen 6 haneli kodu girin.': 'Enter the 6-digit code sent ${notificationChannel === "SMS" ? "via SMS to your phone" : "to your email address"}.',
  ", çadır ${pendingCamp.tentCapacity}": ", tent ${pendingCamp.tentCapacity}",
  "Bekleyen başvuru yok.": "No pending applications.",
  "Etkinlik oluşturuldu: ${response.data.title}": "Event created: ${response.data.title}",
  "Giriş: ${camp.checkInTime}": "Check-in: ${camp.checkInTime}",
  "Kamp fotoğrafı (JPEG/PNG)": "Campsite photo (JPEG/PNG)",
  "Kamp oluşturuldu: ${response.data.name} (${response.data.customerNumber})": "Campsite created: ${response.data.name} (${response.data.customerNumber})",
  "Kamp sahibi için kamp alanı oluştur": "Create a campsite for a camp owner",
  "Kampçı": "Camper",
  "Kampınız oluşturuldu (${response.data.customerNumber}). Yayına alınmadan önce admin onayı bekleniyor.": "Your campsite has been created (${response.data.customerNumber}). It is awaiting admin approval before going live.",
  "Kullanıcılara git": "Go to users",
  "Oluşturduğun etkinlikleri ve bilet satışlarını buradan takip edebilirsin.": "You can track the events you created and their ticket sales here.",
  "Personel rezervasyonu onaylayamaz, reddedemez veya iptal edemez; onaylanmış rezervasyonu \u201cgeldi\u201d, giriş yapılmış rezervasyonu \u201cçıktı\u201d olarak işaretleyebilir.": "Staff cannot approve, reject, or cancel a reservation; they can mark an approved reservation as \u201carrived\u201d or a checked-in reservation as \u201cdeparted\u201d.",
  "Rezervasyon oluşturuldu: ${response.data.reservationCode}": "Reservation created: ${response.data.reservationCode}",
  "Seed verisinde kamp sahibi genelde ownerId=2 oluyor. Farklı kamp sahibi varsa ID değerini değiştir.": "In the seed data, the camp owner is usually ownerId=2. Change the ID value if you have a different camp owner.",
  "Sistem yöneticisi": "System administrator",
  "Sistem yönetimi": "System management",
  "Tüm kampları gör": "View all campsites",
  "Tüm rezervasyonları gör": "View all reservations",
  "Çıkış: ${camp.checkOutTime}": "Check-out: ${camp.checkOutTime}",
  "\u201c${camp.name}\u201d kamp yerini silmek istediğinize emin misiniz? Kampın rezervasyonları, etkinlikleri ve fotoğrafları da kalıcı olarak silinecek.": "Are you sure you want to delete the campsite \u201c${camp.name}\u201d? Its reservations, events, and photos will also be permanently deleted.",
  "⛺ Çadır": "⛺ Tent",

};

const originalTextValues = new WeakMap<Text, string>();
const originalAttributeValues = new WeakMap<HTMLElement, Map<string, string>>();
let translatingDocument = false;

function translateText(value: string) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();

  if (translations[core]) return `${leading}${translations[core]}${trailing}`;

  let translated = core;
  const entries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of entries) {
    if (translated.includes(from)) translated = translated.split(from).join(to);
  }
  return translated === core ? value : `${leading}${translated}${trailing}`;
}

function translateDocument(language: Language) {
  if (translatingDocument || !document.body) return;
  translatingDocument = true;
  try {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const parent = textNode.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) continue;
      if (!originalTextValues.has(textNode)) originalTextValues.set(textNode, textNode.nodeValue ?? "");
      const original = originalTextValues.get(textNode) ?? "";
      const desired = language === "en" ? translateText(original) : original;
      if (textNode.nodeValue !== desired) textNode.nodeValue = desired;
    }

    document.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label], input[type=submit][value], input[type=button][value]").forEach((element) => {
      let values = originalAttributeValues.get(element);
      if (!values) {
        values = new Map<string, string>();
        originalAttributeValues.set(element, values);
      }
      for (const attribute of ["placeholder", "title", "aria-label", "value"]) {
        const current = element.getAttribute(attribute);
        if (current === null) continue;
        if (!values.has(attribute)) values.set(attribute, current);
        const original = values.get(attribute) ?? current;
        const desired = language === "en" ? translateText(original) : original;
        if (current !== desired) element.setAttribute(attribute, desired);
      }
    });
  } finally {
    translatingDocument = false;
  }
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (turkishText: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("tr");

  useEffect(() => {
    const saved = window.localStorage.getItem("camppal-language");
    if (saved === "tr" || saved === "en") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("camppal-language", language);
    translateDocument(language);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((mutations) => {
      if (translatingDocument) return;
      const hasNewContent = mutations.some((mutation) => mutation.type === "childList" && mutation.addedNodes.length > 0);
      if (!hasNewContent) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => translateDocument(language), 30);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (text) => language === "en" ? translateText(text) : text,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
