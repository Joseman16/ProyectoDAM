import React from "react";
import { Text } from "react-native";
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen, colors } from "../components/ui";
import LoginScreen from "../screens/LoginScreen";
import CourseListScreen from "../screens/CourseListScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import AssignmentSubmitScreen from "../screens/AssignmentSubmitScreen";
import ForumDiscussionsScreen from "../screens/ForumDiscussionsScreen";
import ForumPostsScreen from "../screens/ForumPostsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type MainTabParamList = {
  Courses: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  CourseDetail: { courseId: number; courseName: string };
  AssignmentSubmit: { assignId: number; activityName: string };
  ForumDiscussions: { forumId: number; forumName: string };
  ForumPosts: { discussionId: number; subject: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: "700" as const, color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Courses"
        component={CourseListScreen}
        options={{
          title: "Cursos",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen message="Iniciando Campus UG..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={{ title: "Actividades" }}
            />
            <Stack.Screen
              name="AssignmentSubmit"
              component={AssignmentSubmitScreen}
              options={{ title: "Entregar tarea" }}
            />
            <Stack.Screen
              name="ForumDiscussions"
              component={ForumDiscussionsScreen}
              options={{ title: "Foro" }}
            />
            <Stack.Screen
              name="ForumPosts"
              component={ForumPostsScreen}
              options={{ title: "Discusión" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
