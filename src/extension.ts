import * as vscode from 'vscode';

/**
 * Стиль оформления для четных чисел.
 * Задает синий цвет фона.
 */
const evenDecoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: 'rgba(0, 102, 255, 0.82)'
});

/**
 * Стиль оформления для нечетных чисел.
 * Задает розовый цвет фона.
 */
const oddDecoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: 'rgba(255, 0, 217, 0.31)'
});

let isHighlighting = false; // Флаг состояния выделения

/**
 * Находит и выделяет все числа в активном редакторе.
 * Четные числа выделяются синим цветом, нечетные - розовым.
 * 
 * Алгоритм:
 * 1. Получает текст из активного редактора
 * 2. Находит все целые числа с помощью регулярного выражения
 * 3. Разделяет числа на четные и нечетные
 * 4. Применяет соответствующие стили оформления
 */
function highlightNumbers() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const text = editor.document.getText();
	const evenRanges: vscode.Range[] = [];
	const oddRanges: vscode.Range[] = [];

	const numberRegex = /\b\d+\b/g;
	let match;

	while ((match = numberRegex.exec(text)) !== null) {
		const number = parseInt(match[0]);
		const startPos = editor.document.positionAt(match.index);
		const endPos = editor.document.positionAt(match.index + match[0].length);
		const range = new vscode.Range(startPos, endPos);

		(number % 2 === 0 ? evenRanges : oddRanges).push(range);
	}

	editor.setDecorations(evenDecoration, evenRanges);
	editor.setDecorations(oddDecoration, oddRanges);
}

/**
 * Удаляет все выделения чисел из активного редактора.
 * Очищает декорации для четных и нечетных чисел.
 */
function clearHighlights() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	// Очищаем выделения пустыми массивами
	editor.setDecorations(evenDecoration, []);
	editor.setDecorations(oddDecoration, []);
}

/**
 * Переключает состояние выделения чисел.
 * При включении выделяет все числа в активном редакторе.
 * При выключении удаляет все выделения.
 * Показывает информационное сообщение пользователю
 */
function toggleHighlighting() {
	if (isHighlighting) {
		clearHighlights();
		isHighlighting = false;
		vscode.window.showInformationMessage('Number highlighting disabled!');
	} else {
		highlightNumbers();
		isHighlighting = true;
		vscode.window.showInformationMessage('Number highlighting enabled!');
	}
}

/**
 * Активирует плагин при его загрузке в VS Code.
 * 
 * Параметры:
 * context (vscode.ExtensionContext): контекст расширения для управления подписками
 * 
 * Выполняет:
 * 1. Регистрирует команду переключения выделения
 * 2. Применяет начальную выделения чисел
 * 3. Подписывается на события изменения текста и смены редактора
 * 
 * Подписки:
 * - onDidChangeTextDocument: обновляет веделение при изменении текста
 * - onDidChangeActiveTextEditor: обновляет выделение при смене редактора
 */
export function activate(context: vscode.ExtensionContext) {
	// Команда-переключатель подсветки
	const toggleCommand = vscode.commands.registerCommand('labwork3-isrpo.highlightNumbers', () => {
		toggleHighlighting();
	});

	context.subscriptions.push(toggleCommand);

	// Автоматическое выделение при старте плагина
	highlightNumbers();

	// Слушатели событий (работают только когда выделение включено)
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(() => {
			if (isHighlighting) {
				highlightNumbers();
			}
		}),
		vscode.window.onDidChangeActiveTextEditor(() => {
			if (isHighlighting) {
				highlightNumbers();
			}
		})
	);
}

/**
 * Деактивирует расширение при его выгрузке из VS Code.
 * Выполняет очистку ресурсов и отписку от событий.
 */
export function deactivate() { }