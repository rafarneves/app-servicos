import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
        }}
      />

      <Tabs.Screen
        name="sobre"
        options={{
          title: 'Sobre',
        }}
      />

      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
        }}
      />

      <Tabs.Screen
        name="contato"
        options={{
          title: 'Contato',
        }}
      />
    </Tabs>
  );
}