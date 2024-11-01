import { getKeys } from 'util/getKeys';
import { Inject } from '../../core/injector';
import { Hotkey, HotkeysService, IHotkey } from '../../hotkeys';
import { ArrayNode } from './array-node';

interface IContext {
  sceneId?: string;
  sceneItemId?: string;
  sourceId?: string;
}

export class HotkeysNode extends ArrayNode<IHotkey, IContext, Hotkey> {
  schemaVersion = 2;

  @Inject()
  private hotkeysService: HotkeysService;

  getItems(context: IContext = {}): Hotkey[] {
    let items: Hotkey[] = [];
    if (context.sceneId) {
      items = this.hotkeysService.getSceneHotkeys(context.sceneId);
    } else if (context.sceneItemId) {
      items = this.hotkeysService.getSceneItemHotkeys(context.sceneItemId);
    } else if (context.sourceId) {
      items = this.hotkeysService.getSourceHotkeys(context.sourceId);
    } else {
      items = this.hotkeysService.getGeneralHotkeys();
    }
    return items.filter(hotkey => hotkey.bindings.length);
  }

  saveItem(hotkey: Hotkey, context: IContext): Promise<IHotkey> {
    const hotkeyObj = hotkey.getModel();
    getKeys(context).forEach(key => delete hotkeyObj[key]);
    return Promise.resolve(hotkeyObj);
  }

  loadItem(obj: IHotkey, context: IContext): Promise<void> {
    this.hotkeysService.addHotkey({ ...obj, ...context });
    return Promise.resolve();
  }

  migrate(version: number) {
    // We don't support version 1 hotkey schemas
    if (version === 1) this.data = { items: [] };
  }
}
