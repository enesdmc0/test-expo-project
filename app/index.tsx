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

import { useState, useEffect, useRef } from "react";
import { Text, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sabit değerler
const NOTIFICATION_INTERVAL = 15; // dakika
const LAST_NOTIFICATION_KEY = "last_notification_time";

// Bildirimlerin nasıl gösterileceğini ayarlıyoruz
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Todo listesi
const todos: string[] = [
  "Günlük egzersizlerini yap 🏃‍♂️",
  "Su içmeyi unutma 💧",
  "E-postalarını kontrol et 📧",
  "Günlük planını gözden geçir 📝",
  "Ailenle görüntülü konuşma yap 👨‍👩‍👧‍👦",
  "Kitap okumaya zaman ayır 📚",
  "Ev bitkilerini sula 🌱",
  "Akşam yemeği için plan yap 🍳",
  "Günlük hedeflerini gözden geçir ✅",
  "Kısa bir yürüyüşe çık 🚶‍♂️",
];

// Son bildirim zamanını kontrol et
const canSendNotification = async (): Promise<boolean> => {
  try {
    const lastNotificationTime = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    if (!lastNotificationTime) return true;

    const now = new Date().getTime();
    const lastTime = parseInt(lastNotificationTime);
    const timeDiff = now - lastTime;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return minutesDiff >= NOTIFICATION_INTERVAL;
  } catch (error) {
    console.error("Bildirim zamanı kontrolü hatası:", error);
    return true;
  }
};

// Rastgele todo seçme
function getRandomTodo(): string {
  const randomIndex = Math.floor(Math.random() * todos.length);
  return todos[randomIndex];
}

// Bildirim gönderme
async function scheduleLocalNotification(): Promise<void> {
  const canSend = await canSendNotification();

  if (!canSend) {
    console.log("Bildirim gönderme süresi henüz gelmedi");
    return;
  }

  const now = new Date().getTime();

  try {
    // Mevcut bildirimleri temizle
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Yeni bildirim zamanını kaydet
    await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, now.toString());

    // 30 saniye sonrası için bildirim planla
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📌 Günlük Hatırlatma",
        body: getRandomTodo(),
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 15 * 60,
        repeats: false,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
  }
}

// Bildirimleri kurma
async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Bildirim izni verilmedi!");
      return false;
    }
  }
  return true;
}

export default function App() {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [lastNotificationTime, setLastNotificationTime] = useState<string>("");
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // İlk kurulum
    const setup = async () => {
      const hasPermission = await setupNotifications();
      if (hasPermission) {
        await scheduleLocalNotification(); // İlk bildirimi planla
      }
    };

    setup();

    // Bildirim dinleyicileri
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
      const time = new Date().toLocaleTimeString();
      setLastNotificationTime(time);
      scheduleLocalNotification(); // Bir sonraki bildirimi planla
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    // Son bildirim zamanını yükle
    const loadLastNotificationTime = async () => {
      try {
        const time = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
        if (time) {
          const date = new Date(parseInt(time));
          setLastNotificationTime(date.toLocaleTimeString());
        }
      } catch (error) {
        console.error("Son bildirim zamanı yüklenirken hata:", error);
      }
    };

    loadLastNotificationTime();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  async function clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("📢 Tüm zamanlanmış bildirimler iptal edildi!");
  }
  
  clearAllNotifications(); // Tüm bildirimleri iptal etmek için

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>Son Bildirim:</Text>
        <Text>Başlık: {notification?.request?.content?.title} </Text>
        <Text>İçerik: {notification?.request?.content?.body}</Text>
        {lastNotificationTime && <Text>Gönderim Zamanı: {lastNotificationTime}</Text>}
      </View>
    </View>
  );
}
