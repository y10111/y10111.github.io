## 1. Java的注释

注释是用来对代码进行解释说明。

Java中的注释分为3种形式：

1. 单行注释

   ```java
   // 输出Hello World语句
   System.out.println("hello world");
   ```

2. 多行注释

   ```java
   /*
   这是Java程序的入口
   mian方法被称为主方法
   包含主方法的类称为主类
    */
   public static void main(String[] args) {
     // 输出Hello World语句
     System.out.println("hello world");
   }
   ```

3. 文档注释

   ```java
   /**
    * @author: yanghuaqiang
    * @description: //TODO
    * @date: 2026/4/11 上午10:34
    * @param: [a, b]
    * @return: int
    */
   public static int add(int a, int b) {
     return a + b;
   }
   ```

## 2. Java的关键字

关键字：有特殊意义的单词，全部都是小写的。

保留字：预留的关键字，还未在Java中使用。

### 2.1 全局关键字（51个）

| 关键字        | 关键字     | 关键字       | 关键字      | 关键字         |
| :------------ | :--------- | :----------- | :---------- | :------------- |
| `abstract`    | `continue` | `for`        | `new`       | `switch`       |
| `assert`      | `default`  | `if`         | `package`   | `synchronized` |
| `boolean`     | `do`       | `goto`       | `private`   | `this`         |
| `break`       | `double`   | `implements` | `protected` | `throw`        |
| `byte`        | `else`     | `import`     | `public`    | `throws`       |
| `case`        | `enum`     | `instanceof` | `return`    | `transient`    |
| `catch`       | `extends`  | `int`        | `short`     | `try`          |
| `char`        | `final`    | `interface`  | `static`    | `void`         |
| `class`       | `finally`  | `long`       | `strictfp`  | `volatile`     |
| `const`       | `float`    | `native`     | `super`     | `while`        |
| `_`（下划线） |            |              |             |                |

### 2.2 上下文关键字（16个）

| 关键字       | 关键字     | 关键字       | 关键字  |
| :----------- | :--------- | :----------- | :------ |
| `exports`    | `opens`    | `requires`   | `uses`  |
| `module`     | `permits`  | `sealed`     | `var`   |
| `non-sealed` | `provides` | `tc`         | `with`  |
| `open`       | `record`   | `transitive` | `yield` |

### 2.3 其他

| 类别          | 关键字                  |
| :------------ | :---------------------- |
| 保留字（3个） | `const`, `goto`, `_`    |
| 废弃的关键字  | `strictfp`              |
| 特殊值        | `true`, `false`, `null` |

## 3. 标识符

标识符是用来给Java中的类、方法、变量等命名的单词。

**标识符的命名规则**：

- 虽然所有的字符都可以用来作为Java的标识符，但是强烈建议只使用26个英文字母、数字0-9、下划线、美元符号$
- 数字不能开头
- 一个标识符之间不能出现空格
- 严格区分大小写
- 不能直接使用关键字、保留字、特殊值作为标识符

**标识符的命名规范**：

- 尽量见名知意
- 类名等遵循大驼峰命名规则，即每一个单词首字母大写，例如：HelloWorld等，形式：XxxYyyZzz
- 方法名、变量名等遵循小驼峰命名规则，即从第二个单词开始首字母大写，例如：myAge，形式：xxxYyyZzz
- 包名，所有单词都小写
- 常量，所有单词都大些，例如：MAX_VALUE

## 4. Java的基本数据类型

Java是面向对象的编程语言，数据类型分为两大类：

- 基本数据类型：一共有8种
- 引用数据类型：凡是引用数据类型的值都是对象

```java
整数类型：
  byte < short < int < long
小数类型（Java中习惯称之为浮点型，他是不精确的，计算有误差）：
  float < double
  float单精度浮点型，大约可以表示（科学计数法）小数后7-8位
  double是双精度浮点型，大约可以表示（科学计数法）小数后15-16位
单字符类型：
  char
布尔类型：
  boolean
```

> **注意**：
>
> String不属于基本数据类型，属于引用数据类型，它是对象

## 5. 字面量值

- long类型的字面量值，需要在数字后面（末尾）加L或l
- float类型的字面量值，需要在数字后面（末尾）加F或f
- 单字符类型的字面量值，需要加单引号
- 字符串类型的字面量值，需要加单引号

```java
public class LiteralValueTest {
	public static void main(String[] args) {
		System.out.println(9999999999L);
		System.out.println(3.14F);

		float f = 3.141592653589793f; //3.1415927
		double d = 3.141592653589793; //3.141592653589793
		System.out.println(f);
		System.out.println(d);

		System.out.println('a');
    System.out.println("hello");
	}
}
```

- 转义字符

```java
public class EscapeCharacterTest {
	public static void main(String[] args) {
		// \' 单引号
		System.out.println('\''); //'

		// \" 双引号
		System.out.println('\"'); //"

		// \t 制表位tab
		System.out.println("yanghuaqiang\tis\ta\tbody");
		System.out.println("yang\tis\ta\tstudent");
		/*
		huaqiang	is	a	body
		yang			is	a	student
		 */

		// \d 退格键backspace
		System.out.println("Hello\bWorld"); //HellWorld

		// \n 换行
		System.out.println("Hello\nWorld");
		/*
		Hello
		World
		 */

		// \r 回车，其作用是将光标移动到当前行的开头（最左侧）
		System.out.println("Hello\rWorld"); //World
		
		// \\ \ 本身
		System.out.println("Hello\\World"); //Hello\World
	}
}
```

