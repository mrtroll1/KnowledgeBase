// Publisher - Subscriber
    interface UseCaseSubscriber {
        do(): void
    }

    interface Publisher {
        subscribe(sub: UseCaseSubscriber);
        unsubscribe(sub: UseCaseSubscriber);
    }

    class UseCase implements Publisher {
        private subscribers: UseCaseSubscriber[]

        public execute() {
            // do something
            this.notifySubscribers()
        }

        public subscribe(sub: UseCaseSubscriber) {
            this.subscribers.push(sub);
        }

        public unsubscribe(sub: UseCaseSubscriber) {
            this.subscribers.filter((subscriber) => subscriber != sub)
        }

        private notifySubscribers() {
            this.subscribers.map((subscriber) => {
                subscriber.do()
            })
        }
    }

    class PostUseCaseCleaner {
        public do() {
            // ...
        }
    }

    const useCase = new UseCase();
    const cleaner = new PostUseCaseCleaner();
    useCase.subscribe(cleaner);
    useCase.execute();

    // alternatively, subscriptions and notifications can be managed by a third entity

// Message Bus
    type Message = {
        id: string;
        type: string;
        done: boolean;
    }

    class MessageBus {
        public static messages: Message[]

        public static addMessage(message: Message) {
            MessageBus.messages.push(message);
        }

        public static markMessageAsDone(id: string) {
            const [message] = MessageBus.messages.filter((message) => {
                message.id === id;
            })
            message.done = true;
        }
    }

    class AnotherUseCase {
        public execute() {
            // do something
            this.addMessageToBus()
        }

        private addMessageToBus() {
            const message = {
                id: 'random-uuid',
                type: 'use-case-executed',
                done: false
            } as Message

            MessageBus.addMessage(message);
        }
    }

    interface BusPoller {
        run()
        getUnDoneMessages(): Message[]
    }

    class PostUseCaseWrapper implements BusPoller {
        run() {
            // every once in a while
            const messages = this.getUnDoneMessages()
            messages.map((message) => {
                this.do(message);
                MessageBus.markMessageAsDone(message.id);
            })
        }

        getUnDoneMessages(): Message[] {
            return MessageBus.messages.filter((message) => {
                message.type === 'use-case-executed'
            }) 
        }

        public do(message: Message) {
            // do something
        }
    }

// Singleton
    // -: Vague dependency flow, One per process (not trully global)

// Factory method, Abstract factory, Template method
    // Factory method
    type Entity = {}

    class User implements Entity {}

    abstract class Repository {
        protected abstract createEntity(): Entity
    }

    class UserRepository extends Repository {
        protected createEntity(): User {
            return new User()
        }
    }  

    // Abstract factory
    interface Button {}
    interface Checkbox {}

    class WinButton implements Button {}
    class WinCheckbox implements Checkbox {}

    class MacButton implements Button {}
    class MacCheckbox implements Checkbox {}

    interface GUIFactory {
        createButton(): Button;
        createCheckbox(): Checkbox;
    }

    class WinFactory implements GUIFactory {
        createButton() { return new WinButton(); }
        createCheckbox() { return new WinCheckbox(); }
    }
    class MacFactory implements GUIFactory {
        createButton() { return new MacButton(); }
        createCheckbox() { return new MacCheckbox(); }
    }

    function buildUI(factory: GUIFactory) {
        const btn = factory.createButton();
        const chk = factory.createCheckbox();
        // do something
    }

    buildUI(new MacFactory()); 

    // Template method
    // Put the skeleton of an algorithm in a base class, and let subclasses override specific steps (execute of reply use-cases)

// MVC - UI delivery pattern
    // Fat model, thin controller, dumb view