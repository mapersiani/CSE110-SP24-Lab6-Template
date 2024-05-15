describe("Note-taking App E2E Tests", () => {
  beforeAll(async () => {
    await page.goto("http://127.0.0.1:5501/index.html");
  });

  it("test add a new note", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "New Note");
    await page.keyboard.press("Tab");

    const noteText = await page.$eval(
      ".note:last-child",
      (element) => element.value
    );
    expect(noteText).toBe("New Note");
  });

  it("test edit a new note", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Note to Edit");
    await page.keyboard.press("Tab");

    await page.click(".note:last-child");
    await page.type(".note:last-child", " Edited");
    await page.keyboard.press("Tab");

    const noteText = await page.$eval(
      ".note:last-child",
      (element) => element.value
    );
    expect(noteText).toBe("Note to Edit Edited");
  });

  it("test erase and edit an existing note", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Existing Note");
    await page.keyboard.press("Tab");

    await page.click(".note:last-child", { clickCount: 3 });
    await page.type(".note:last-child", "Edited");
    await page.keyboard.press("Tab");

    const noteText = await page.$eval(
      ".note:last-child",
      (element) => element.value
    );
    expect(noteText).toBe("Edited");
  });

  it("test saving notes locally", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Persistent Note");
    await page.keyboard.press("Tab");

    await page.reload();
    const noteText = await page.$eval(
      ".note:last-child",
      (element) => element.value
    );
    expect(noteText).toBe("Persistent Note");
  });

  it("test deleting a note by double-clicking", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Note to Delete");
    await page.keyboard.press("Tab");
    const noteCountBefore = await page.$$eval(".note", (notes) => notes.length);

    await page.evaluate(() => {
      const note = document.querySelector(".note:last-child");
      const event = new MouseEvent("dblclick", { bubbles: true });
      note.dispatchEvent(event);
    });

    const noteCountAfter = await page.$$eval(".note", (notes) => notes.length);
    expect(noteCountAfter).toBe(noteCountBefore - 1);
  });

  it("test deleting all notes with Ctrl + Shift + D", async () => {
    await page.click(".add-note");
    await page.type(".note:last-child", "Note 1");
    await page.keyboard.press("Tab");

    await page.click(".add-note");
    await page.type(".note:last-child", "Note 2");
    await page.keyboard.press("Tab");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.evaluate(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          ctrlKey: true,
          shiftKey: true,
          key: "D",
        })
      );
    });

    const noteCount = await page.$$eval(".note", (notes) => notes.length);
    expect(noteCount).toBe(0);
  });

  it("should verify note count after adding notes", async () => {
    const initialNoteCount = await page.$$eval(
      ".note",
      (notes) => notes.length
    );

    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Note 1");
    await page.keyboard.press("Tab");

    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Note 2");
    await page.keyboard.press("Tab");

    const finalNoteCount = await page.$$eval(".note", (notes) => notes.length);
    expect(finalNoteCount).toBe(initialNoteCount + 2);
  });

  it("should verify note count after deleting a note", async () => {
    await page.click(".add-note");
    await page.waitForSelector(".note:last-child");
    await page.type(".note:last-child", "Note to Delete");
    await page.keyboard.press("Tab");

    const noteCountBefore = await page.$$eval(".note", (notes) => notes.length);

    await page.evaluate(() => {
      const note = document.querySelector(".note:last-child");
      const event = new MouseEvent("dblclick", { bubbles: true });
      note.dispatchEvent(event);
    });

    const noteCountAfter = await page.$$eval(".note", (notes) => notes.length);
    expect(noteCountAfter).toBe(noteCountBefore - 1);
  });
});
