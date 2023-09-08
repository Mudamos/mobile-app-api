const nconf = require('nconf');
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const mkdirp = require('mkdirp');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const { Buffer } = require("buffer");
const { PdfReader } = require("pdfreader");

nconf
	.use('memory')
	.argv()
	.env();

class PDFCreate {

	constructor(options) {

		this.widthPage = 595;
		this.heightPage = 842;
		this.marginSecurity = 40;

		this.text = {
			"digital": "\u0020\u0020Esse é um arquivo assinado digitalmente"
			, "access": "\u0020\u0020Você pode verificar sua autenticidade acessando"
			, "link": "\u0020\u0020http://www.mudamos.org"
			, "botton": `\u0020\u0020///---------------------------------- ? ----------------------------------///`
		};

		this.options = options;

		this.options.lines_page = this.options.lines_page > this.options.lines ? this.options.lines : this.options.lines_page;
		this.qtdPage = Math.round(this.options.lines.length / this.options.lines_page) == 0 ? 1 : Math.round(this.options.lines.length / this.options.lines_page);

		this.doc = new PDFDocument(
			{
				layout: 'portrait',
				size: "A4",
				bufferPages: false,
				margins: { top: this.options.margins.top, bottom: this.options.margins.botton, left: this.options.margins.left, right: this.options.margins.right }
			})
	}

	addSubTitle(line, y) {
		var width = this.doc.widthOfString(line.message) > this.widthPage ? this.widthPage - 10 : this.doc.widthOfString(line.message);
		var height = this.doc.currentLineHeight();

		this.doc.font(this.options.font.path_mudamo_bold)
			.fontSize(line.font)
			.fillColor(line.message.indexOf('não informado') > 0 ? 'red' : 'black')
			.text(`\u0020${line.message}`, this.options.margin_left_subtitle, this.doc.y + this.options.font.size - 1, width, height);
	}

	async addCoverPage(page_index) {
		var that = this;
		return new Promise((resolve, reject) => {

			that.doc.font(that.options.font.path_mudamo_bold)
				.fontSize(that.options.font.size + 15)
				.text(that.options.petition_name, (that.widthPage - that.doc.widthOfString(that.options.petition_name)) / 2, (that.heightPage - 300) / 2);

			that.doc.font(that.options.font.path_mudamo_bold)
				.fontSize(that.options.font.size + 3)
				.text(that.options.petiton_date, (that.widthPage - that.doc.widthOfString(that.options.petiton_date)) / 2, (that.heightPage - 240) / 2);

			that.doc.font(that.options.font.path_mudamos)
				.fontSize(that.options.font.size + 3)
				.fillColor('blue')
				.text(that.options.petition_url, (that.widthPage - that.doc.widthOfString(that.options.petition_url)) / 2, (that.heightPage - 180) / 2);
			resolve(true);
		})
	}

  async addCoverAnonymisedPage(pageIndex, sha) {
    this.doc.switchToPage(pageIndex);
    this.doc.font(this.options.font.path_mudamo_bold)
      .fontSize(this.options.font.size + 15)
      .text(this.options.petition_name, (this.widthPage - this.doc.widthOfString(this.options.petition_name)) / 2, (this.heightPage - 300) / 2);

    this.doc.font(this.options.font.path_mudamo_bold)
      .fontSize(this.options.font.size + 3)
      .text(this.options.petiton_date, (this.widthPage - this.doc.widthOfString(this.options.petiton_date)) / 2, (this.heightPage - 240) / 2);

    this.doc.font(this.options.font.path_mudamos)
      .fontSize(this.options.font.size + 3)
      .fillColor('blue')
      .text(this.options.petition_url, (this.widthPage - this.doc.widthOfString(this.options.petition_url)) / 2, (this.heightPage - 180) / 2);

    this.doc.font(this.options.font.path_mudamos)
      .fontSize(this.options.font.size + 3)
      .fillColor('black')
      .text('Assinatura Digital da listagem completa', (this.widthPage - this.doc.widthOfString('Assinatura Digital da listagem completa')) / 2, (this.heightPage - 120) / 2)
      .fillColor('black')
      .text(sha, (this.widthPage - this.doc.widthOfString(sha)) / 2, (this.heightPage - 60) / 2);

    return true;
  }

  async addPageFacePetitionInfo(covers) {
    const getCovers = () => {
      const pathFolder = path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}/images/petition/${this.options.petition_id}`);
      const files = fs.readdirSync(pathFolder);
      return files.sort().map(file => `${pathFolder}/${file}`);
    };

    const files = covers || getCovers();

    files.forEach((file, index) => {
      this.addPage();
      this.doc.image(file, this.options.position.top, this.options.position.left, { width: this.width, height: this.heightPage });

      if (index === files.length - 1) {
        this.doc.font(this.options.font.path_mudamos)
          .fontSize(this.options.font.size)
          .text(this.text.digital, (this.widthPage - this.doc.widthOfString(this.text.digital)) / 2, this.heightPage - 57);

        this.doc.font(this.options.font.path_mudamos)
          .fontSize(this.options.font.size)
          .text(this.text.access, (this.widthPage - this.doc.widthOfString(this.text.access)) / 2, this.heightPage - 42);

        this.doc.font(this.options.font.path_mudamos)
          .fontSize(this.options.font.size)
          .fillColor('blue')
          .text(this.text.link, (this.widthPage - this.doc.widthOfString(this.text.link)) / 2, this.heightPage - 27);
      }
    });

    return true;
  }

	addPage() {
		this.doc.addPage({
			layout: 'portrait',
			size: "A4",
			margins: { top: this.options.position.top, bottom: this.options.position.botton, left: this.options.position.left, right: this.options.position.right },
		});
		this.doc.moveDown(); this.doc.moveDown(); this.doc.moveDown();
		return this.doc.bufferedPageRange().count - 1;
	}

	addBreakPageBotton(message) {
		this.doc.moveDown();
		this.doc.moveDown();
		this.doc.font(this.options.font.path_mudamos)
			.fontSize(this.options.font.size)
			.text(this.text.botton.replace('?', message), { align: 'center' });
	}

  async processLines() {
    const isNextPage = (y, lineSize, marginSecurity, pageHeigth, type) => {
      var result = (((y + lineSize) + marginSecurity) > pageHeigth);
      if (type)
        result = (((y + lineSize) + marginSecurity) > pageHeigth);
      return result;
    };

    const getWidthLine = (width, widthPage) => width > widthPage ? widthPage - 100 : width;
    const verifyTypeSwitchPage = (type) => type == 'state' || type == 'city' || type == 'district' ? true : false;
    const verifyTypeState = (type) => type == 'state' ? true : false;
    const verifyTypeCityAndDistrict = (type) => (type == 'city' || type == 'district') ? true : false;

    let actualState;

    for (let index = 0; index < this.options.lines.length; index++) {
      if (verifyTypeSwitchPage(this.options.lines[index].type) && isNextPage(this.doc.y, 20, this.marginSecurity, this.heightPage, this.options.lines[index].type)) {
        this.addPage();
      }
      if (verifyTypeState(this.options.lines[index].type)) {
        if (index > 0) {
          this.addBreakPageBotton(`${actualState} - fim`);
          this.addBreakPageBotton(`${this.options.lines[index].message} - início`);
        }
        actualState = this.options.lines[index].message;
        this.addSubTitle(this.options.lines[index], this.doc.y);
        this.doc.moveDown();
      } else if (verifyTypeCityAndDistrict(this.options.lines[index].type)) {
        this.addSubTitle(this.options.lines[index], this.doc.y);
        this.doc.moveDown();
      } else {
        const width = getWidthLine(this.doc.widthOfString(this.options.lines[index].message, this.widthPage), this.widthPage);
        const height = this.doc.currentLineHeight();

        this.doc.font(this.options.font.path)
          .fontSize(this.options.lines[index].font ? this.options.lines[index].font : this.options.font.size)
          .fillColor('black')
          .text(`${this.options.lines[index].message}`, this.options.marging_left, this.doc.y, { width: 535, height: height * 2, align: 'left' });

        if (this.options.lines[index].link != '')
          this.doc.link(this.options.marging_left, this.doc.y - height, width, height == 0 ? this.options.font.size : height, this.options.lines[index].link, { align: 'left' });

        this.doc.moveDown();

        if (isNextPage(this.doc.y, this.options.font.size, this.marginSecurity, this.heightPage, this.options.lines[index].type)) {
          this.addPage();
        }
      }
    }

    return true;
  }

	async close() {
		return new Promise((resolve, reject) => {
			var writeStream = fs.createWriteStream(this.options.path);
			this.doc.pipe(writeStream);
			writeStream.on('finish', function () {
				resolve(true);
			});
			this.doc.end();
		})
	}

	static async loadPDF(file) {
		return new Promise((resolve, reject) => {
			function printRows() {
				Object.keys(rows)
					.sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
					.forEach((y) => {
						var text = (rows[y] || []).join('');
						lines.push(text)
					});
			}
			var rows = {};
			var lines = [];
			var linesProcess = [];
      const pdfReader = new PdfReader();
      const parseItems = Buffer.isBuffer(file) ? pdfReader.parseBuffer : pdfReader.parseFileItems;

			parseItems.call(pdfReader, file, function (err, item) {
				if (!item || item.page) {
					printRows()
					rows = {};
					if (!item) {
						var count = 0;
						_.forEach(lines, (line, index) => {
							if (line.indexOf(';') > 0 && line.indexOf('>') < 0) {
								if (line.indexOf('.') > 0) {
									var element = line.concat(lines[index + 1]);
									element = element.replace(/^[0-9]*\.\s{3}|\s{3}$/g, '');
									if (element) {
										linesProcess.push(element);
									}
								}
							}
						})
						resolve(linesProcess)
					}
				}
				else if (item.text) {
					(rows[item.y] = rows[item.y] || []).push(item.text);
				}
			});
		})
	}

	static async generateSHA256(file) {
		return new Promise((resolve, reject) => {
			var algo = 'sha256';
			var shasum = crypto.createHash(algo);
			var s = fs.ReadStream(file);
			s.on('data', function (d) { shasum.update(d); });
			s.on('end', function () {
				resolve(shasum.digest('hex'));
			});
		});
	}
}

module.exports = PDFCreate;
