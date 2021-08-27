import App, {RequireComponent} from "./Component.types";

describe('App',() => {
  it('should work', function () {
    App()({name: 'no',version:'1.0.0'} as unknown as RequireComponent)
  });
})
