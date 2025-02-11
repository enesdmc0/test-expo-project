// import { useState, useEffect, useRef } from 'react';
// import { Text, View, Button, Platform } from 'react-native';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// // Bildirimlerin nasıl gösterileceğini ayarlıyoruz
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// // Rastgele todo listesi
// const todos = [
//   "Günlük egzersizlerini yap 🏃‍♂️",
//   "Su içmeyi unutma 💧",
//   "E-postalarını kontrol et 📧",
//   "Günlük planını gözden geçir 📝",
//   "Ailenle görüntülü konuşma yap 👨‍👩‍👧‍👦",
//   "Kitap okumaya zaman ayır 📚",
//   "Ev bitkilerini sula 🌱",
//   "Akşam yemeği için plan yap 🍳",
//   "Günlük hedeflerini gözden geçir ✅",
//   "Kısa bir yürüyüşe çık 🚶‍♂️"
// ];

// // Rastgele todo seçme fonksiyonu
// function getRandomTodo() {
//   const randomIndex = Math.floor(Math.random() * todos.length);
//   return todos[randomIndex];
// }

// // Bildirim gönderme fonksiyonu
// async function sendPushNotification(expoPushToken: string) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title: '📌 Günlük Hatırlatma',
//     body: getRandomTodo(),
//     data: { type: 'todo' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

// // Hata yönetimi
// function handleRegistrationError(errorMessage: string) {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// }

// // Bildirim izinleri için kayıt fonksiyonu
// async function registerForPushNotificationsAsync() {
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       handleRegistrationError('Bildirim izni verilmedi!');
//       return;
//     }
//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError('Proje ID bulunamadı');
//     }
//     try {
//       const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
//       return token;
//     } catch (e: unknown) {
//       handleRegistrationError(`${e}`);
//     }
//   } else {
//     handleRegistrationError('Bildirimler için fiziksel cihaz kullanmalısınız');
//   }
// }

// // Bir sonraki 15 dakikalık aralığı bulma fonksiyonu
// function getNextQuarterHour() {
//   const now = new Date();
//   const minutes = now.getMinutes();
//   const nextQuarter = Math.ceil(minutes / 15) * 15;
//   const nextTime = new Date(now.setMinutes(nextQuarter, 0, 0));
//   return nextTime;
// }

// export default function App() {
//   const [expoPushToken, setExpoPushToken] = useState('');
//   const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
//   const notificationListener = useRef<Notifications.EventSubscription>();
//   const responseListener = useRef<Notifications.EventSubscription>();
//   const timerRef = useRef<NodeJS.Timeout>();

//   useEffect(() => {
//     // Bildirim izinlerini al
//     registerForPushNotificationsAsync()
//       .then(token => {
//         if (token) setExpoPushToken(token);
//       })
//       .catch(error => console.error(error));

//     // Bildirim dinleyicilerini ayarla
//     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//     });

//     // 15 dakikalık zamanlayıcıyı başlat
//     const setupTimer = () => {
//       const now = new Date();
//       const nextTime = getNextQuarterHour();
//       const delay = nextTime.getTime() - now.getTime();

//       timerRef.current = setTimeout(async () => {
//         if (expoPushToken) {
//           await sendPushNotification(expoPushToken);
//         }
//         setupTimer(); // Bir sonraki 15 dakika için yeniden ayarla
//       }, delay);
//     };

//     setupTimer();

//     // Cleanup
//     return () => {
//       if (notificationListener.current) {
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       }
//       if (responseListener.current) {
//         Notifications.removeNotificationSubscription(responseListener.current);
//       }
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//     };
//   }, [expoPushToken]);

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
//       <Text>Expo push token: {expoPushToken}</Text>
//       <View style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Son Bildirim:</Text>
//         <Text>Başlık: {notification && notification.request.content.title} </Text>
//         <Text>İçerik: {notification && notification.request.content.body}</Text>
//       </View>
//       <Button
//         title="Hemen Bildirim Gönder"
//         onPress={async () => {
//           if (expoPushToken) {
//             await sendPushNotification(expoPushToken);
//           }
//         }}
//       />
//     </View>
//   );
// }