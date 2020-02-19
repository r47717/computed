const LOGGING = false;

interface IGlobalState {
    computing: Derivation | null;
}

const globalState: IGlobalState = {
    computing: null,
};

type ValueType = number;

class Observable {
    private observers = new Set<Derivation>();

    constructor(private value: ValueType = 0) {
    }

    get() {
        LOGGING && console.log('observable get');
        if (globalState.computing && !this.observers.has(globalState.computing)) {
            LOGGING && console.log('new observer found and added');
            this.observers.add(globalState.computing);
        }
        return this.value;
    }

    set(val: ValueType) {
        if (val === this.value) return;
        this.value = val;
        LOGGING && console.log('observable set');
        this.observers.forEach((item: Derivation) => {
            LOGGING && console.log('observable sends update to observer');
            item.update(this);
        });
    }
}

class Derivation extends Observable {

    constructor(private func: () => ValueType) {
        super();
        this.compute();
    }

    private compute() {
        globalState.computing = this;
        this.set(this.func());
        globalState.computing = null;
    }

    update(updated: Observable): void {
        LOGGING && console.log('observer got update request from one of observables... computing');
        this.compute();
    }
}

const observable = (value: ValueType): Observable => new Observable(value);
const computed = (func: () => ValueType): Derivation => new Derivation(func);


/////// tests ///////


const days = observable(1);
const hours = computed(() => days.get() * 24);
const minutes = computed(() => hours.get() * 60);
const seconds = computed(() => minutes.get() * 60);

for (let i = 0; i < 10; i++) {
    days.set(days.get() + 1);
    console.log(days.get(), hours.get(), minutes.get(), seconds.get());
}

