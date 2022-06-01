import { Component, Input, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../interfaces';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-socials',
  templateUrl: './socials.component.html',
  styleUrls: ['./socials.component.scss']
})
export class SocialsComponent implements OnInit {
  data: Button[] = [
    { icon: 'icon-Soc-Twitter', dataType: 'twitter', classMod: 'social' },
    { icon: 'icon-Soc-Telegram', dataType: 'telegram', classMod: 'social' },
    { icon: 'icon-Soc-Whatsapp', dataType: 'whatsapp', classMod: 'social' },
    { icon: 'icon-Soc-Facebook', dataType: 'facebook', classMod: 'social' }
  ];

  buttonCopy: Button = {
    name: 'Copy Link',
    icon: 'icon-Copy-2',
    classMod: 'social'
  };

  messageText = 'Download Gaimin platform and join gaimin.io community';

  constructor(
    private electronService: ElectronService,
    private toastrService: ToastrService,
    private clipboardService: ClipboardService
  ) {}

  @Input() referralLink: string;

  ngOnInit() {}

  onClick(target) {
    const button = target.closest('button');
    const type = button.dataset.type;

    this.openExternalWindow(this.getUrl(type));
  }

  getUrl(type) {
    switch (type) {
      case 'facebook':
        return 'http://www.facebook.com/sharer.php?u=' + this.referralLink;
      case 'twitter':
        return 'https://twitter.com/intent/tweet?text=' + this.messageText + ' ' + this.referralLink;
      case 'telegram':
        return 'https://t.me/share/url?url=' + this.referralLink + '&text=' + this.messageText;
      case 'whatsapp':
        return 'https://api.whatsapp.com/send?text=' + this.messageText + ' ' + this.referralLink;
    }
  }

  openExternalWindow(url) {
    this.electronService.shell.openExternal(url);
  }

  copyReferralLink() {
    this.clipboardService.copy(this.referralLink);
    this.toastrService.success('The link copied.');
  }
}
