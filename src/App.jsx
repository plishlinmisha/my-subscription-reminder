// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Panel,
  PanelHeader,
  Group,
  Header,
  Cell,
  Button,
  Separator,
  Div,
  FormItem,
  Input,
  Text,
  IconButton
} from '@vkontakte/vkui';
import { Icon24Cancel } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

// Определяем ID для нашей основной панели
const MAIN_PANEL = 'main';

export const App = () => {
  // Состояние для списка подписок
  const [subscriptions, setSubscriptions] = useState([]);
  // Состояние для полей ввода новой подписки
  const [newSubscriptionName, setNewSubscriptionName] = useState('');
  const [newSubscriptionDate, setNewSubscriptionDate] = useState('');
  // Состояние для активной панели (у нас будет только одна)
  const [activePanel, setActivePanel] = useState(MAIN_PANEL);

  // Загрузка данных из localStorage при монтировании компонента
  useEffect(() => {
    const savedSubscriptions = localStorage.getItem('subscriptions');
    if (savedSubscriptions) {
      try {
        // Преобразуем строки дат обратно в объекты Date
        const parsedSubscriptions = JSON.parse(savedSubscriptions).map((s) => ({
          ...s,
          endDate: new Date(s.endDate)
        }));
        setSubscriptions(parsedSubscriptions);
      } catch (e) {
        console.error("Ошибка при загрузке подписок из localStorage:", e);
        // Если данные повреждены, начинаем с пустого массива
        setSubscriptions([]);
      }
    }
  }, []); // Пустой массив зависимостей - выполнится один раз при монтировании

  // Сохранение данных в localStorage при изменении subscriptions
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]); // Зависимость от subscriptions - выполнится при каждом его изменении

  // Обработчик добавления новой подписки
  const handleAddSubscription = () => {
    if (newSubscriptionName.trim() && newSubscriptionDate) {
      const newSub = {
        id: Date.now().toString(), // Простой способ генерации уникального ID
        name: newSubscriptionName.trim(),
        endDate: new Date(newSubscriptionDate),
        isCancelled: false
      };
      setSubscriptions([...subscriptions, newSub]);
      // Очищаем поля ввода после добавления
      setNewSubscriptionName('');
      setNewSubscriptionDate('');
    }
  };

  // Обработчик переключения статуса "Отменена"
  const handleToggleCancel = (id) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, isCancelled: !sub.isCancelled } : sub
    ));
  };

  // Обработчик удаления подписки
  const handleDeleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  // Функция для проверки, близка ли дата окончания (меньше или равно 3 дням)
  const isCloseToExpiry = (endDate) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <View activePanel={activePanel}>
      <Panel id={MAIN_PANEL}>
        <PanelHeader>Напоминалка о подписках</PanelHeader>

        {/* Форма добавления новой подписки */}
        <Group header={<Header mode="secondary">Добавить подписку</Header>}>
          <FormItem top="Название сервиса">
            <Input
              type="text"
              placeholder="Например, Netflix"
              value={newSubscriptionName}
              onChange={(e) => setNewSubscriptionName(e.target.value)}
            />
          </FormItem>
          <FormItem top="Дата окончания пробного периода / след. платеж">
            <Input
              type="date"
              value={newSubscriptionDate}
              onChange={(e) => setNewSubscriptionDate(e.target.value)}
            />
          </FormItem>
          <FormItem>
            <Button
              size="l"
              stretched
              onClick={handleAddSubscription}
              disabled={!newSubscriptionName.trim() || !newSubscriptionDate}
            >
              Добавить
            </Button>
          </FormItem>
        </Group>

        <Separator />

        {/* Список подписок */}
        <Group header={<Header mode="secondary">Ваши подписки</Header>}>
          {subscriptions.length === 0 ? (
            <Div>Подписок пока нет. Добавьте первую!</Div>
          ) : (
            subscriptions.map((sub) => {
              const isClose = isCloseToExpiry(sub.endDate);
              
              // Определяем, нужен ли индикатор слева
              let beforeIndicator = null;
              if (isClose && !sub.isCancelled) {
                beforeIndicator = <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--destructive)' }} />;
              }

              return (
                <Cell
                  key={sub.id}
                  multiline
                  before={beforeIndicator} // Используем заранее вычисленное значение
                  indicator={
                    <Text weight="regular" style={{ color: sub.isCancelled ? 'var(--text_tertiary)' : isClose ? 'var(--destructive)' : 'var(--text_secondary)' }}>
                      {sub.isCancelled ? 'Отменена' : `До ${sub.endDate.toLocaleDateString('ru-RU')}`}
                    </Text>
                  }
                  asideContent={
                    sub.isCancelled ? (
                      <IconButton onClick={() => handleDeleteSubscription(sub.id)}>
                        <Icon24Cancel />
                      </IconButton>
                    ) : (
                      <Button mode="outline" size="s" onClick={() => handleToggleCancel(sub.id)}>
                        Отменить
                      </Button>
                    )
                  }
                >
                  <Text weight="semibold">{sub.name}</Text>
                  {!sub.isCancelled && isClose && (
                    <Text style={{ color: 'var(--destructive)' }}>Не забудьте отменить!</Text>
                  )}
                </Cell>
              );
            })
          )}
        </Group>
      </Panel>
    </View>
  );
};