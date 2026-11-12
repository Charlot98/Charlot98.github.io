# 图像分割工具ITK-SNAP与3D slicer在医学图像分割中的比较

> 比较 ITK-SNAP 与 3D Slicer 的手动和半自动分割工具。

[IMAIOS原文链接](https://www.imaios.com/jp/1/3/itk-snap-vs-3d-slicer?utm_source=chatgpt.com)[3D slicer](https://www.slicer.org/)

更新时间：2021/05/20
作者：Julie Desternes

在筛选出最佳的医学图像标注软件后，我们选择了 ITK-SNAP 和 3D Slicer，并对它们进行比较，以简化您为项目选择软件的过程。这两款软件都适用于自动分割项目。

标注阶段，更具体地说是医学图像分割，是在深度学习数据准备框架内进行的。正是基于此目标，本文对 ITK-SNAP 和 3D Slicer 两款软件进行了比较，以确定哪款软件最适合执行此步骤。本文是**之前关于用于深度学习的医学图像标注免费软件文章**的逻辑延续。本文将基于用户体验和软件自带文档，介绍这些软件提供的分割工具。此外，本文还将阐述与预期应用领域相关的其他优缺点。

## ITK-SNAP：图像分割软件测试

### 手动分割工具：

手动分割工具中，有两种：

1. 画笔模式 （以及使用右键单击的橡皮擦）：可以修改此工具中的几个参数（大小、形状（体积）……），它允许进行细微调整以及分割较小的区域。

![paintbrush mode](/paintbruch_inspector_ITKSNAP.png)

1. 多边形模式允许您绘制待分割区域的轮廓并自动填充。这将有助于分割大面积区域。
2. 为了简化手动分割，可以分割某些关键切片，并在这些切片之间进行插值。要使用插值功能，请转到“工具”下拉菜单，然后单击“插值标签...”。

![02](/2026-01-02-02.png)

### 半自动分割工具

ITK-SNAP 具有半自动区域分割工具： **Snake**。它分四个步骤使用 ：

1. 用边界框定义轮廓 ，缩小**感兴趣区域**。
2. 根据所需应用，选择 4 种不同的方法（阈值法、分类法、区域法和边缘检测法）对感兴趣区域进行**预分割**。
3. 从bubles中初始化snakes。
4. 利用active contour evolution 算法控制snake路径的传播，直至获得精确的区域分割结果。在最后一步中，可以调整各种速度参数来影响传播路径，并限制其逃离目标区域。

### 测试结果：我们对该工具的看法

优势： ITK-SNAP 是一款纯粹的分割软件，并为此提供了许多实用工具。这些工具数量不多，因此用户很容易上手。此外，其键盘和鼠标快捷键（例如缩放、切片导航等）与医学成像领域常用的快捷键类似，使用起来非常流畅。
**缺点**： 工具数量少，当用户遇到分割困难时会受到惩罚，因为他没有其他工具可以用来建立变通方法。
分割数据与深度学习方法的兼容性：
该软件功能齐全，可对多种解剖结构进行分割。分割标签已编号，用户可以重命名标签并为其分配颜色。数据可以导出为多种格式，包括数据分析中常用的格式（NIfTI、NRRD、VTK）。

## 3D Slicer：测试图像分割模块

### 手动分割工具

3D Slicer 包含三个手动分割工具：

1. Paint 工具对于小区域的分割尤为重要
2. Erase 擦除
3. 绘图功能可用于描绘解剖结构的轮廓，只需单击鼠标右键即可自动填充。它有助于分割大面积区域。

The first two can be configured (volume and diameter) and can also be used on the 3D view in addition to the cross-sectional images.
前两个参数（体积和直径）可以进行配置，除了横截面图像外，还可以用于 3D 视图。

To complete the drawing tool, when drawings have been made at a few strategic intervals, it is possible to interpolate with the "fill between slices" tool.
为了完善绘图工具，当在几个战略间隔处绘制图形后，可以使用“ 填充切片之间 ”工具进行插值。

### 半自动分割工具

A number of tools can be described as semi-automatic are available to the user, among them:
用户可使用多种半自动工具，其中包括：

- Level tracing incorporates in a single region all the pixels of the region having a uniform level of intensity. Its objective is to find a closed path with the same intensity value. As with the drawing tool, it is possible to interpolate between 2 slices.
- 色阶追踪将区域内所有具有均匀强度值的像素合并到一个区域中。其目标是找到一条强度值相同的闭合路径。与绘图工具类似，它也可以对两个切片进行插值。
- Growing from seeds <span>

6

</span>

 enables the segmentation of several anatomical structures simultaneously by positioning seeds inside each of the regions thanks to the paint tool and also in the background region (which can be deleted). Each anatomical structure/region that we want to segment must have a label as growing will be done from these seeds. This method uses a region growing algorithm.
- 基于种子点的生长方法 <span>

6

</span>

能够通过绘制工具在每个区域内以及背景区域（可删除）放置种子点，从而同时分割多个解剖结构。每个待分割的解剖结构/区域都必须有标签，因为生长过程将从这些种子点开始。该方法采用区域生长算法。
- The threshold separates the voxels of the image into two categories according to their intensity. By setting the threshold or thresholds (upper and/or lower), we define an intensity range belonging to the region to be segmented. Several thresholding methods are available in 3D Slicer (Otsu, Huang, Isodata...).
阈值根据图像体素的强度将其分为两类。通过设置一个或多个阈值（上限和/或下限），我们可以定义待分割区域的强度范围。3D Slicer 中提供了多种阈值分割方法（例如 Otsu、Huang、Isodata 等）。
- The scissors eliminate the elements located inside (or outside depending on the selected parameter) the whole specific area. Their advantage is that they can also be used on the reconstructed image in 3D, which saves time in the removal of elements not belonging to the area of interest.
- 剪刀工具可以去除位于特定区域内部（或外部，取决于所选参数）的元素。其优势在于，它还可以用于重建的 3D 图像，从而节省去除不属于目标区域的元素的时间。
- With the islands tool the notion of connectedness is central. Indeed, the connected voxels are grouped in a single region. The user has various options, he can keep the largest island (region), delete all the small islands (with the possibility to change the minimum size) or divide the islands into different segments...
- 使用岛屿工具时，连通性是核心概念。实际上，相互连通的体素会被归为同一区域。用户有多种选择，例如保留最大的岛屿（区域）、删除所有小岛屿（可以更改最小尺寸），或者将岛屿分割成不同的区域……

### 测试结果：我们对该工具的看法

Pros: 3D Slicer is an extensive software, including several modules for image processing. One of its modules is entirely dedicated to segmentation, with many interesting tools that facilitate the segmentation of medical images. The segmentation tools detailed above are also complemented by other tools such as filters (median, closing, opening...), logical operators (addition, subtraction...), interpolations... Moreover, all the tools available with 3D Slicer can be configured to edit a segmentation only between the selected thresholds, outside of the other segmentations already edited, on the whole image or even within a particular segmentation. The choice of tools available with 3D Slicer allows the user to approach segmentation in different ways.
**优点**： 3D Slicer 是一款功能强大的软件，包含多个图像处理模块。其中一个模块专门用于图像分割，提供许多实用工具，可简化医学图像的分割过程。除了上述分割工具外，该软件还提供其他辅助工具，例如滤波器（中值滤波、闭运算、开运算等）、逻辑运算符（加法、减法等）和插值等。此外，3D Slicer 的所有工具均可配置为仅在选定阈值范围内编辑分割结果，且可编辑已编辑的分割结果，也可编辑整幅图像或特定分割区域内的结果。3D Slicer 提供的丰富工具使用户能够以不同的方式进行图像分割。

Cons: The user needs some time to get the hang of the software. This is due to the quantity of modules and tools available. The 3D display slows down the actions of segmentations carried out, it is important to think of deactivating it to work in an optimal way.
**缺点**： 用户需要一些时间才能熟练掌握该软件。这是因为其模块和工具数量众多。3D 显示会减慢分割操作的速度，因此为了获得最佳使用体验，建议考虑将其关闭。

**分割数据与深度学习方法的兼容性：**
The labels can be renamed, the desired color can be assigned to each label and there is a whole panel of pre-registered anatomical structures with their associated color. Data export can be done in different formats including one of the most common formats used in data analysis **(NRRD)**.
标签可以重命名，每个标签都可以分配所需的颜色，并且还有一个预注册的解剖结构面板，每个结构都对应一种颜色。数据可以导出为多种格式，包括数据分析中最常用的格式之一**（NRRD）**。

Comparative table  对比表

## 比较结果总结

3D Slicer is a global and general software in the field of image processing, while ITK-SNAP is oriented only on image segmentation. The semi-automatic segmentation method proposed by ITK-SNAP is very complete and allows to obtain good results once the tool is understood and mastered by the user. 3D Slicer provides the user with a variety of tools based on different approaches, which the user can combine to obtain the desired result. It is largely due to the presence of all these segmentation tools that 3D Slicer can take a little longer to learn than ITK-SNAP.
3D Slicer 是一款全球通用的图像处理软件，而 ITK-SNAP 则专注于图像分割。ITK-SNAP 提供的半自动分割方法非常完善，用户一旦理解并掌握了该工具，就能获得良好的分割效果。3D Slicer 为用户提供了基于不同方法的各种工具，用户可以将这些工具组合起来以获得所需的结果。正是由于这些分割工具的存在，3D Slicer 的学习时间可能比 ITK-SNAP 稍长一些。

Regarding the support of medical images (especially in DICOM format), the results of the segmentations and the available formats for data export, both software are appropriate and compatible in an automatic segmentation project using deep learning methods.
对于医学图像（特别是 DICOM 格式）的支持、分割结果以及可用的数据导出格式， 这两款软件在使用深度学习方法的自动分割项目中都是合适且兼容的 。

A comparison table was made in order to justify the choice of one software over the other by the user in the context of medical image annotations for deep learning.
为了证明用户在深度学习的医学图像标注背景下选择某一款软件而不是另一款软件的合理性，我们制作了一个比较表。

After experimenting with the segmentation of several abdominal organs as well as the skeleton and comparing these two software, 3D Slicer was selected.
在对几个腹部器官以及骨骼进行分割实验并比较了这两款软件之后，我们选择了 3D Slicer 。

The Snake tool from ITK-SNAP is very powerful and allows precise segmentations (figure 1). But the approach of a segmentation can only be make from one angle and when faced with a difficulty, the user must therefore refer to the manual segmentation.
ITK-SNAP 中的 Snake 工具功能非常强大，可以进行精确分割（图 1）。但是，分割只能从一个角度进行，因此，当遇到困难时，用户必须参考手动分割。

3D Slicer has been able to distinguish itself on several points, and particularly on the variety and performance of the tools available (manual, semi-automatic and complementary segmentation); this allows us to obtain an accurate segmentation of the anatomical structures (figure 2), while maintaining a reasonable processing time. This variety of tools offers the user some freedom on the choice of a segmentation as well as on the possible solutions, when he is faced with a difficulty during the segmentation.
3D Slicer 在多个方面脱颖而出，尤其是在可用工具的种类和性能方面（手动、半自动和辅助分割）；这使得我们能够在保持合理处理时间的同时，获得精确的解剖结构分割结果（图 2）。这些丰富的工具为用户提供了一定的分割选择自由度，并在分割过程中遇到困难时，能够找到相应的解决方案。
