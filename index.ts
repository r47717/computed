type ValueType = number;

/*
 * Global state
 */

interface IGlobalState {
    computing: IDerivation | null;
}

const globalState: IGlobalState = {
    computing: null,
};


/*
 * Observable
 */

interface IObservable {
}

class Observable implements IObservable {
    private observers = new Set<IDerivation>();

    constructor(private value: ValueType = 0) {
    }

    get() {
        if (globalState.computing && !this.observers.has(globalState.computing)) {
            this.observers.add(globalState.computing);
        }
        return this.value;
    }

    set(val: ValueType) {
        if (val === this.value) return;
        this.value = val;
        this.observers.forEach((item: IDerivation) => {
            item.update(this);
        });
    }
}


/*
 * Derivation
 */

interface IDerivation {
    update(updated: IObservable): void;
}

class Derivation extends Observable implements IDerivation {

    constructor(private func: () => ValueType) {
        super();
        this.compute();
    }

    private compute() {
        globalState.computing = this;
        this.set(this.func());
        globalState.computing = null;
    }

    update(updated: IObservable): void {
        this.compute();
    }
}


/*
 * Reaction
 */

class Reaction implements IDerivation {
    constructor(private func: () => any) {
        this.run();
    }

    run() {
        globalState.computing = this;
        this.func();
        globalState.computing = null;
    }

    update(updated: IObservable): void {
        this.run();
    }
}


/*
 * API
 */

const observable = (value: ValueType): Observable => new Observable(value);
const computed = (func: () => ValueType): Derivation => new Derivation(func);
const autorun = (func: () => any): void => {
    new Reaction(func);
};


/////// tests ///////


const days = observable(1);
const hours = computed(() => days.get() * 24);
const minutes = computed(() => hours.get() * 60);
const seconds = computed(() => minutes.get() * 60);

autorun(() => console.log(seconds.get()));

for (let i = 0; i < 10; i++) {
    days.set(days.get() + 1);
}

