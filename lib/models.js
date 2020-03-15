class Room {
  constructor(room) {
    Object.assign(this, room);
  }

  static validateRoom(room) {
    return room.programMode && room.roomId;
  }

  get mode() {
    return this.currentMode > 0 ? this.currentMode : this.programMode;
  }

  set mode(mode) {
    if (mode >= 0 && mode <= 5) {
      this.currentMode = mode;
    }
  }

  get modeName() {
    switch (this.mode) {
      case 1:
        return 'Comfort';
      case 2:
        return 'Sleep';
      case 3:
        return 'Away';
      case 4:
        return 'Holiday';
      case 5:
        return 'Off';
      default:
        return 'Unknown';
    }
  }

  set modeName(name) {
    switch (name) {
      case 'Program':
        this.currentMode = 0;
        break;
      case 'Comfort':
        this.currentMode = 1;
        break;
      case 'Sleep':
        this.currentMode = 2;
        break;
      case 'Away':
        this.currentMode = 3;
        break;
      case 'Holiday':
        this.currentMode = 4;
        break;
      case 'Off':
        this.currentMode = 5;
        break;
      default:
        break;
    }
  }

  get targetTemp() {
    switch (this.mode) {
      case 1:
        return this.comfortTemp;
      case 2:
        return this.sleepTemp;
      case 3:
        return this.awayTemp;
      case 4:
        return this.holidayTemp;
      case 5:
        return 0;
      default:
        return 0;
    }
  }

  set targetTemp(temp) {
    switch (this.mode) {
      case 1:
        this.comfortTemp = temp;
        break;
      case 2:
        this.sleepTemp = temp;
        break;
      case 3:
        this.awayTemp = temp;
        break;
      case 4:
        this.holidayTemp = temp;
        break;
      default:
        break;
    }
  }

  get isHeating() {
    return this.heatStatus === 1;
  }

  modesMatch(room) {
    return this.currentMode === room.currentMode && this.programMode === room.programMode;
  }
}


module.exports = Room;
