const TryCatchConsumer = (handler: Function) => {
  return async (message: any) => {
    try {
      await handler(message);
    } catch (error) {
      console.error("Consumer Error ❌", error);
    }
  };
};

export default TryCatchConsumer;
