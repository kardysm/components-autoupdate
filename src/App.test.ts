import App, {RequireComponent} from "./App";

describe('App',() => {
  it('should work', function () {
    App()({name: 'no',version:'1.0.0'} as unknown as RequireComponent)
  });
})
