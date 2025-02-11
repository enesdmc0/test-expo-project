import { useState, useEffect, useRef } from "react";
import { Text, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const NOTIFICATION_INTERVAL = 0.25;
const LAST_NOTIFICATION_KEY = "last_notification_time";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

function getRandomTodo(): string {
  const randomIndex = Math.floor(Math.random() * todos.length);
  return todos[randomIndex];
}

async function scheduleLocalNotification(): Promise<void> {
  const canSend = await canSendNotification();

  if (!canSend) {
    console.log("Bildirim gönderme süresi henüz gelmedi");
    return;
  }

  const now = new Date().getTime();

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, now.toString());

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📌 Günlük Hatırlatma",
        body: getRandomTodo(),
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 15,
        repeats: false,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
  }
}

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
    const setup = async () => {
      const hasPermission = await setupNotifications();
      if (hasPermission) {
        await scheduleLocalNotification();
      }
    };

    setup();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
      const time = new Date().toLocaleTimeString();
      setLastNotificationTime(time);
      scheduleLocalNotification();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

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

  // clearAllNotifications();

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
