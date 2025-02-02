import * as remote from '@electron/remote';
import ModalLayout from 'components/ModalLayout.vue';
import { omit } from 'lodash';
import { Inject } from 'services/core/injector';
import { NVoiceCharacterType, NVoiceCharacterTypes } from 'services/nvoice-character';
import { ScenesService } from 'services/scenes';
import { SourcesService, TPropertiesManager, TSourceType } from 'services/sources';
import { UserService } from 'services/user';
import { WindowsService } from 'services/windows';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AddFileIcon from '../../../media/images/add-file-icon.svg';
import AddSceneIcon from '../../../media/images/add-scene-icon.svg';
import AppAudioCaptureSourceIcon from '../../../media/images/app-speaker.svg';
import BlackmagicSourceIcon from '../../../media/images/blackmagic-icon.svg';
import BrowserSourceIcon from '../../../media/images/browser-source-icon.svg';
import CharacterSourceIcon from '../../../media/images/character-source-icon.svg';
import ColorSourceIcon from '../../../media/images/color-source-icon.svg';
import DshowInputIcon from '../../../media/images/display-icon.svg';
import FfmpegSourceIcon from '../../../media/images/ffmpeg-source-icon.svg';
import GameCaptureIcon from '../../../media/images/game-capture-icon.svg';
import MonitorCaptureIcon from '../../../media/images/monitor-capture-icon.svg';
import NdiSourceIcon from '../../../media/images/ndi-icon.svg';
import VLCSourceIcon from '../../../media/images/play.svg';
import {
  default as ImageSourceIcon,
  default as SlideshowIcon,
} from '../../../media/images/slideshow-icon.svg';
import SpeechEngineIcon from '../../../media/images/speech-engine.svg';
import TextGdiplusIcon from '../../../media/images/text-gdiplus-icon.svg';
import WasapiInputCaptureIcon from '../../../media/images/wasapi-input-icon.svg';
import WasapiOutputIcon from '../../../media/images/wasapi-output-icon.svg';
import WindowCaptureIcon from '../../../media/images/window-capture-icon.svg';
import AddSourceInfo from './AddSourceInfo.vue';

type TInspectableSource = TSourceType | NVoiceCharacterType;

interface ISelectSourceOptions {
  propertiesManager?: TPropertiesManager;
  nVoiceCharacterType?: NVoiceCharacterType;
}

@Component({
  components: {
    ModalLayout,
    AddSourceInfo,
    BrowserSourceIcon,
    ColorSourceIcon,
    DshowInputIcon,
    ImageSourceIcon,
    WindowCaptureIcon,
    AddSceneIcon,
    AddFileIcon,
    WasapiInputCaptureIcon,
    TextGdiplusIcon,
    GameCaptureIcon,
    FfmpegSourceIcon,
    SlideshowIcon,
    WasapiOutputIcon,
    MonitorCaptureIcon,
    NdiSourceIcon,
    BlackmagicSourceIcon,
    CharacterSourceIcon,
    AppAudioCaptureSourceIcon,
    VLCSourceIcon,
    SpeechEngineIcon,
  },
})
export default class SourcesShowcase extends Vue {
  @Inject() sourcesService: SourcesService;
  @Inject() userService: UserService;
  @Inject() scenesService: ScenesService;
  @Inject() windowsService: WindowsService;

  selectSource(sourceType: TInspectableSource, options: ISelectSourceOptions = {}) {
    if (!this.readyToAdd) {
      return;
    }
    if (sourceType === 'custom_cast_ndi_source') {
      const propertiesManagerSettings: Dictionary<any> = {
        ...omit(options, 'propertiesManager'),
        propertiesManager: 'custom-cast-ndi',
      };
      this.sourcesService.showAddSource('ndi_source', propertiesManagerSettings);
    } else if (NVoiceCharacterTypes.includes(sourceType as NVoiceCharacterType)) {
      const propertiesManagerSettings: Dictionary<any> = {
        NVoiceCharacterType: sourceType as NVoiceCharacterType,
        ...omit(options, 'propertiesManager'),
      };
      this.sourcesService.showAddSource('browser_source', {
        propertiesManagerSettings,
        propertiesManager: 'nvoice-character',
      });
    } else {
      const propertiesManager = options.propertiesManager || 'default';
      const propertiesManagerSettings: Dictionary<any> = { ...omit(options, 'propertiesManager') };

      this.sourcesService.showAddSource(sourceType as TSourceType, {
        propertiesManagerSettings,
        propertiesManager,
      });
    }
  }

  inspectedSource: TInspectableSource = null;

  inspectSource(inspectedSource: TInspectableSource) {
    this.inspectedSource = inspectedSource;
  }

  get loggedIn() {
    return this.userService.isLoggedIn();
  }

  get platform() {
    if (!this.loggedIn) return null;
    return this.userService.platform.type;
  }

  selectInspectedSource() {
    this.selectSource(this.inspectedSource);
  }

  get availableSources() {
    return this.sourcesService.getAvailableSourcesTypesList().filter(type => {
      if (type.value === 'text_ft2_source') return false;
      if (type.value === 'scene' && this.scenesService.scenes.length <= 1) return false;
      return true;
    });
  }

  downloadNdiRuntime() {
    remote.shell.openExternal('http://ndi.link/NDIRedistV5');
  }

  get readyToAdd() {
    if (this.inspectedSource === 'nair-rtvc-source') {
      // 同一scene上では1つだけ
      for (const s of this.scenesService.activeScene.items) {
        if (this.sourcesService.getSourceById(s.sourceId).type === 'nair-rtvc-source') return false;
      }
    }

    return this.inspectedSource !== null && this.inspectedSource !== 'custom_cast_ndi_guide';
  }
}
