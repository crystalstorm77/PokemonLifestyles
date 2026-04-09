using Microsoft.Maui.Graphics;

#if WINDOWS
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Graphics.Imaging;
#endif

#if ANDROID
using AndroidBitmap = Android.Graphics.Bitmap;
using AndroidBitmapFactory = Android.Graphics.BitmapFactory;
#endif

namespace LifestylesMaui
{
    public sealed partial class PixelAlphaHitMask
    {
        #region SEGMENT A — Constants And State
        private const byte DefaultAlphaThreshold = 12;

        private readonly byte[] _alphaValues;
        #endregion // SEGMENT A — Constants And State

        #region SEGMENT B — Construction And Loading
        private PixelAlphaHitMask(int width, int height, byte[] alphaValues)
        {
            Width = width;
            Height = height;
            _alphaValues = alphaValues;
        }

        public int Width { get; }

        public int Height { get; }

        public static async Task<PixelAlphaHitMask> LoadAsync(string fileName)
        {
            try
            {
                return await LoadPlatformMaskAsync(fileName);
            }
            catch
            {
                return CreateEmpty();
            }
        }
        #endregion // SEGMENT B — Construction And Loading

        #region SEGMENT C — Hit Testing
        public bool HitTest(VisualElement view, PointF scenePoint, float hitSlop = 0f, VisualElement? relativeTo = null)
        {
            if (Width <= 0 || Height <= 0 || view.Width <= 0 || view.Height <= 0)
            {
                return false;
            }

            var absoluteBounds = GetAbsoluteBounds(view, relativeTo);
            var localX = scenePoint.X - absoluteBounds.X;
            var localY = scenePoint.Y - absoluteBounds.Y;
            if (localX < 0f || localY < 0f || localX > view.Width || localY > view.Height)
            {
                return false;
            }

            var contentRect = GetRenderedImageRect(view.Width, view.Height);
            if (contentRect.Width <= 0f || contentRect.Height <= 0f)
            {
                return false;
            }

            var expandedContentRect = new RectF(
                contentRect.X - hitSlop,
                contentRect.Y - hitSlop,
                contentRect.Width + (hitSlop * 2f),
                contentRect.Height + (hitSlop * 2f));

            if (localX < expandedContentRect.X || localY < expandedContentRect.Y || localX > expandedContentRect.Right || localY > expandedContentRect.Bottom)
            {
                return false;
            }

            var clampedLocalX = Math.Clamp(localX, contentRect.X, contentRect.Right);
            var clampedLocalY = Math.Clamp(localY, contentRect.Y, contentRect.Bottom);

            var normalizedX = (clampedLocalX - contentRect.X) / contentRect.Width;
            var normalizedY = (clampedLocalY - contentRect.Y) / contentRect.Height;

            var pixelX = Math.Clamp((int)MathF.Floor(normalizedX * Width), 0, Width - 1);
            var pixelY = Math.Clamp((int)MathF.Floor(normalizedY * Height), 0, Height - 1);
            var alpha = _alphaValues[(pixelY * Width) + pixelX];
            return alpha >= DefaultAlphaThreshold;
        }

        private RectF GetRenderedImageRect(double viewWidth, double viewHeight)
        {
            var sourceWidth = (float)Width;
            var sourceHeight = (float)Height;
            var availableWidth = (float)viewWidth;
            var availableHeight = (float)viewHeight;
            var scale = MathF.Min(availableWidth / sourceWidth, availableHeight / sourceHeight);

            var renderedWidth = sourceWidth * scale;
            var renderedHeight = sourceHeight * scale;
            var offsetX = (availableWidth - renderedWidth) * 0.5f;
            var offsetY = (availableHeight - renderedHeight) * 0.5f;

            return new RectF(offsetX, offsetY, renderedWidth, renderedHeight);
        }

        private static RectF GetAbsoluteBounds(VisualElement view)
        {
            var x = (float)(view.X + view.TranslationX);
            var y = (float)(view.Y + view.TranslationY);
            var parent = view.Parent as VisualElement;

            while (parent is not null)
            {
                x += (float)(parent.X + parent.TranslationX);
                y += (float)(parent.Y + parent.TranslationY);
                parent = parent.Parent as VisualElement;
            }

            return new RectF(x, y, (float)view.Width, (float)view.Height);
        }

        private static RectF GetAbsoluteBounds(VisualElement view, VisualElement? relativeTo)
        {
            var viewBounds = GetAbsoluteBounds(view);
            if (relativeTo is null)
            {
                return viewBounds;
            }

            var relativeBounds = GetAbsoluteBounds(relativeTo);
            return new RectF(
                viewBounds.X - relativeBounds.X,
                viewBounds.Y - relativeBounds.Y,
                viewBounds.Width,
                viewBounds.Height);
        }
        #endregion // SEGMENT C - Hit Testing

        #region SEGMENT D — Platform Decoding
        private static PixelAlphaHitMask CreateEmpty()
        {
            return new PixelAlphaHitMask(0, 0, Array.Empty<byte>());
        }

        private static partial Task<PixelAlphaHitMask> LoadPlatformMaskAsync(string fileName);
        #endregion // SEGMENT D — Platform Decoding
    }

#if ANDROID
    public sealed partial class PixelAlphaHitMask
    {
        #region SEGMENT E — Android Decoding
        private static partial async Task<PixelAlphaHitMask> LoadPlatformMaskAsync(string fileName)
        {
            await using var imageStream = await FileSystem.OpenAppPackageFileAsync(fileName);
            using var bitmap = AndroidBitmapFactory.DecodeStream(imageStream);
            if (bitmap is null)
            {
                return CreateEmpty();
            }

            var width = bitmap.Width;
            var height = bitmap.Height;
            var pixelCount = width * height;
            var pixels = new int[pixelCount];
            bitmap.GetPixels(pixels, 0, width, 0, 0, width, height);

            var alphaValues = new byte[pixelCount];
            for (var i = 0; i < pixelCount; i++)
            {
                alphaValues[i] = (byte)((pixels[i] >> 24) & 0xFF);
            }

            return new PixelAlphaHitMask(width, height, alphaValues);
        }
        #endregion // SEGMENT E — Android Decoding
    }
#endif

#if WINDOWS
    public sealed partial class PixelAlphaHitMask
    {
        #region SEGMENT F — Windows Decoding
        private static partial async Task<PixelAlphaHitMask> LoadPlatformMaskAsync(string fileName)
        {
            await using var imageStream = await FileSystem.OpenAppPackageFileAsync(fileName);
            using var randomAccessStream = imageStream.AsRandomAccessStream();
            var decoder = await BitmapDecoder.CreateAsync(randomAccessStream);
            var softwareBitmap = await decoder.GetSoftwareBitmapAsync(BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied);

            var width = (int)softwareBitmap.PixelWidth;
            var height = (int)softwareBitmap.PixelHeight;
            var pixelBuffer = new byte[width * height * 4];
            softwareBitmap.CopyToBuffer(pixelBuffer.AsBuffer());

            var alphaValues = new byte[width * height];
            for (var i = 0; i < alphaValues.Length; i++)
            {
                alphaValues[i] = pixelBuffer[(i * 4) + 3];
            }

            return new PixelAlphaHitMask(width, height, alphaValues);
        }
        #endregion // SEGMENT F — Windows Decoding
    }
#endif

#if !ANDROID && !WINDOWS
    public sealed partial class PixelAlphaHitMask
    {
        #region SEGMENT G — Fallback Decoding
        private static partial Task<PixelAlphaHitMask> LoadPlatformMaskAsync(string fileName)
        {
            return Task.FromResult(CreateEmpty());
        }
        #endregion // SEGMENT G — Fallback Decoding
    }
#endif
}
