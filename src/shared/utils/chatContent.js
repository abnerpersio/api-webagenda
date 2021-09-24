export const listEventsBlipBuilder = (events) => {
  if (!events) {
    return null;
  }

  const blipContent = {
    text: events.length > 0
      ? 'Em qual dos seus eventos deseja mexer?'
      : 'Que pena! Não encontrei eventos para esse telefone',
    options: [],
  };

  events.map((event, index) => blipContent.options.push({
    text: `${event.from.split(' ')[0]} às ${
      event.from.split(' ')[1]
    } com ${event.professional}`,
    order: index + 1,
    type: 'text/plain',
    value: event.id,
  }));

  return blipContent;
};
