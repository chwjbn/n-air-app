import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Inject } from 'util/injector';
import { NicoliveProgramService } from 'services/nicolive-program/nicolive-program';
import { remote } from 'electron';
import { $t } from 'services/i18n';

@Component({
  components: {},
})
export default class NicolivePanelRoot extends Vue {
  @Inject()
  nicoliveProgramService: NicoliveProgramService;

  isCreating: boolean = false;
  async createProgram() {
    try {
      this.isCreating = true;
      return await this.nicoliveProgramService.createProgram();
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isCreating = false;
    }
  }

  isFetching: boolean = false;
  async fetchProgram() {
    try {
      this.isFetching = true;
      return await this.nicoliveProgramService.fetchProgram();
    } catch (e) {
      console.warn(e);
      // TODO: 翻訳
      // TODO: エラー理由を見て出し分ける
      await new Promise(resolve => {
        remote.dialog.showMessageBox(
          remote.getCurrentWindow(),
          {
            type: 'warning',
            message: 'ニコニコ生放送にて番組が作成されていません。\n［番組作成］ボタンより、番組を作成してください。',
            buttons: [$t('common.ok')],
            noLink: true,
          },
          done => resolve(done)
        );
      });
    } finally {
      this.isFetching = false;
    }
  }

  async refreshProgram() {
    try {
      this.isFetching = true;
      return await this.nicoliveProgramService.fetchProgram();
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isFetching = false;
    }
  }

  isEditing: boolean = false;
  async editProgram() {
    try {
      this.isEditing = true;
      return await this.nicoliveProgramService.editProgram();
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isEditing = false;
    }
  }

  isStarting: boolean = false;
  async startProgram() {
    try {
      this.isStarting = true;
      return await this.nicoliveProgramService.startProgram();
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isStarting = false;
    }
  }

  isEnding: boolean = false;
  async endProgram() {
    try {
      this.isEnding = true;
      const isOk = await new Promise(resolve => {
        // TODO: 翻訳
        remote.dialog.showMessageBox(
          remote.getCurrentWindow(),
          {
            type: 'warning',
            message: '番組を終了しますか？',
            buttons: ['終了する', $t('common.cancel')],
            noLink: true,
          },
          idx => resolve(idx === 0)
        );
      });

      if (isOk) {
        return await this.nicoliveProgramService.endProgram();
      }
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isEnding = false;
    }
  }

  isExtending: boolean = false;
  async extendProgram() {
    try {
      this.isExtending = true;
      return await this.nicoliveProgramService.extendProgram();
    } catch (e) {
      // TODO
      console.warn(e);
    } finally {
      this.isExtending = false;
    }
  }

  toggleAutoExtension() {
    this.nicoliveProgramService.toggleAutoExtension();
  }

  isCommentSending: boolean = false;
  operatorCommentValue: string = '';
  async sendOperatorComment(event: KeyboardEvent) {
    const text = this.operatorCommentValue;
    const isPermanent = event.ctrlKey;

    try {
      this.isCommentSending = true;
      await this.nicoliveProgramService.sendOperatorComment(text, isPermanent);
      this.operatorCommentValue = '';
    } catch (err) {
      // TODO
      console.warn(err);
    } finally {
      this.isCommentSending = false;
    }
  }

  get hasProgram(): boolean {
    return this.nicoliveProgramService.hasProgram;
  }

  get programID(): string {
    return this.nicoliveProgramService.state.programID;
  }

  get programStatus(): string {
    return this.nicoliveProgramService.state.status;
  }

  get programTitle(): string {
    return this.nicoliveProgramService.state.title;
  }

  get programDescription(): string {
    return this.nicoliveProgramService.state.description;
  }

  get programEndTime(): number {
    return this.nicoliveProgramService.state.endTime;
  }

  get programStartTime(): number {
    return this.nicoliveProgramService.state.startTime;
  }

  get communityID(): string {
    return this.nicoliveProgramService.state.communityID;
  }

  get communityName(): string {
    return this.nicoliveProgramService.state.communityName;
  }

  get communitySymbol(): string {
    return this.nicoliveProgramService.state.communitySymbol;
  }

  get viewers(): number {
    return this.nicoliveProgramService.state.viewers;
  }

  get comments(): number {
    return this.nicoliveProgramService.state.comments;
  }

  get adPoint(): number {
    return this.nicoliveProgramService.state.adPoint;
  }

  get giftPoint(): number {
    return this.nicoliveProgramService.state.giftPoint;
  }

  get isProgramExtendable() {
    return this.nicoliveProgramService.isProgramExtendable && this.programEndTime - this.currentTime > 60;
  }

  get autoExtensionEnabled() {
    return this.nicoliveProgramService.state.autoExtensionEnabled;
  }

  currentTime: number = 0;
  updateCurrrentTime() {
    this.currentTime = Math.floor(Date.now() / 1000);
  }

  get programCurrentTime(): number {
    return this.currentTime - this.programStartTime;
  }

  get programTotalTime(): number {
    return this.programEndTime - this.programStartTime;
  }

  format(timeInSeconds: number): string {
    const absTime = Math.abs(timeInSeconds);
    const s = absTime % 60;
    const m = Math.floor(absTime / 60) % 60;
    const h = Math.floor(absTime / 3600);
    const sign = Math.sign(timeInSeconds) > 0 ? '' : '-';
    const ss = s.toString(10).padStart(2, '0');
    const mm = m.toString(10).padStart(2, '0');
    const hh = h.toString(10).padStart(2, '0');
    return `${sign}${hh}:${mm}:${ss}`;
  }

  @Watch('programStatus')
  onStatusChange(newValue: string, oldValue: string) {
    if (newValue === 'end') {
      clearInterval(this.timeTimer);
    } else if (oldValue === 'end') {
      clearInterval(this.timeTimer);
      this.startTimer();
    }
  }

  startTimer() {
    this.timeTimer = (setInterval(() => this.updateCurrrentTime(), 1000) as any) as number;
  }

  timeTimer: number = 0;
  mounted() {
    this.startTimer();
  }
}
